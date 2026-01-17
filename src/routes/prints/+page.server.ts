import { PrintJob } from '$lib/models/PrintJob';
import { Spool } from '$lib/models/Spool';
import { Printer } from '$lib/models/Printer';
import { User } from '$lib/models/User';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    await connectDB();

    // Fetch prints with populated fields (Spool and Printer) - filtered by user
    const prints = await PrintJob.find({ user_id: locals.user.id })
        .populate('spool_id', 'brand material color_hex')
        .populate('printer_id', 'name model')
        .sort({ date: -1, _id: -1 })
        .lean();

    // Fetch active spools and printers for the "Log Print" form - filtered by user
    const [spools, printers] = await Promise.all([
        Spool.find({ user_id: locals.user.id, is_active: true }).lean(),
        Printer.find({ user_id: locals.user.id }).lean()
    ]);

    return {
        prints: JSON.parse(JSON.stringify(prints)),
        spools: JSON.parse(JSON.stringify(spools)),
        printers: JSON.parse(JSON.stringify(printers))
    };
};

export const actions: Actions = {
    log: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });

        const formData = await request.formData();
        const name = formData.get('name');
        const spool_id = formData.get('spool_id');
        const printer_id = formData.get('printer_id');
        const duration_minutes = formData.get('duration_minutes');
        const filament_used_g = formData.get('filament_used_g');
        const status = formData.get('status');
        const manual_cost = formData.get('manual_cost');
        const elapsed_minutes = formData.get('elapsed_minutes');
        const stl_file = formData.get('stl_file');
        const date = formData.get('date');

        if (!spool_id || !printer_id || !filament_used_g) {
            return fail(400, { missing: true });
        }

        await connectDB();

        try {
            // 1. Get the spool to calculate cost and deduct weight
            const spool = await Spool.findOne({ _id: spool_id, user_id: locals.user.id });
            if (!spool) return fail(404, { spoolNotFound: true });

            // Verify printer belongs to user
            const printer = await Printer.findOne({ _id: printer_id, user_id: locals.user.id });
            if (!printer) return fail(404, { printerNotFound: true });

            // Get user's electricity rate
            const user = await User.findById(locals.user.id);
            const electricityRate = user?.electricity_rate || 0.12; // Default $/kWh

            const weightUsed = Number(filament_used_g);
            const durationMins = Number(duration_minutes);

            // Calculate Filament Cost: use manual if provided, otherwise calculate
            let costFilament: number;
            if (manual_cost && String(manual_cost).trim() !== '') {
                // If manual cost provided, it's the total cost (filament + electricity)
                costFilament = Number(manual_cost);
            } else {
                costFilament = (spool.price / spool.weight_initial_g) * weightUsed;
            }

            // Calculate Electricity Cost: Power (kW) × Duration (hours) × Rate ($/kWh)
            const powerKw = (printer.power_consumption_watts || 0) / 1000;
            const durationHours = durationMins / 60;
            const costEnergy = powerKw * durationHours * electricityRate;

            // Total cost = filament + electricity (only if not manual)
            let totalCost: number;
            if (manual_cost && String(manual_cost).trim() !== '') {
                totalCost = Number(manual_cost);
            } else {
                totalCost = costFilament + costEnergy;
            }

            // 2. Create Print Job
            const isInProgress = status === 'In Progress';

            // Calculate started_at based on elapsed time
            let startedAt: Date | null = null;
            if (isInProgress) {
                const elapsedMs = Number(elapsed_minutes || 0) * 60 * 1000;
                startedAt = new Date(Date.now() - elapsedMs);
            }

            await PrintJob.create({
                user_id: locals.user.id,
                name: name || 'Untitled Print',
                spool_id,
                printer_id,
                duration_minutes: durationMins,
                filament_used_g: weightUsed,
                calculated_cost_filament: Number(totalCost.toFixed(2)),
                calculated_cost_energy: Number(costEnergy.toFixed(2)),
                status,
                started_at: startedAt,
                stl_file: stl_file || null,
                date: date ? new Date(date as string) : new Date()
            });

            // 3. Deduct Filament from Spool (only if not In Progress)
            if (!isInProgress) {
                spool.weight_remaining_g = Math.max(0, spool.weight_remaining_g - weightUsed);
                await spool.save();
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true });
        }
    },

    edit: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });

        const formData = await request.formData();
        const id = formData.get('id');
        const name = formData.get('name');
        const duration_minutes = formData.get('duration_minutes');
        const filament_used_g = formData.get('filament_used_g');
        const status = formData.get('status');
        const manual_cost = formData.get('manual_cost');
        const elapsed_minutes = formData.get('elapsed_minutes');
        const printer_id = formData.get('printer_id');
        const spool_id = formData.get('spool_id');
        const stl_file = formData.get('stl_file');
        const remove_model = formData.get('remove_model');
        const date = formData.get('date');

        if (!id || !name) {
            return fail(400, { missing: true });
        }

        await connectDB();

        try {
            const printJob = await PrintJob.findOne({ _id: id, user_id: locals.user.id }).populate('spool_id').populate('printer_id');
            if (!printJob) return fail(404, { notFound: true });

            // Get user's electricity rate
            const user = await User.findById(locals.user.id);
            const electricityRate = user?.electricity_rate || 0.12;

            const weightUsed = Number(filament_used_g);
            const durationMins = Number(duration_minutes);

            // Get printer for power calculation
            const printerForCalc = printer_id
                ? await Printer.findById(printer_id)
                : printJob.printer_id;

            // Get correct spool for cost calculation (use new spool if provided, else existing)
            const spoolForCalc = spool_id
                ? await Spool.findById(spool_id)
                : printJob.spool_id;

            // Calculate Filament Cost: use manual if provided, otherwise calculate
            let costFilament: number;
            if (manual_cost && String(manual_cost).trim() !== '') {
                // Manual cost is the total, we'll calculate energy separately for tracking
                costFilament = Number(manual_cost);
            } else if (spoolForCalc?.price && spoolForCalc?.weight_initial_g) {
                costFilament = (spoolForCalc.price / spoolForCalc.weight_initial_g) * weightUsed;
            } else {
                costFilament = 0;
            }

            // Calculate Electricity Cost
            const powerKw = (printerForCalc?.power_consumption_watts || 0) / 1000;
            const durationHours = durationMins / 60;
            const costEnergy = powerKw * durationHours * electricityRate;

            // Total cost
            let totalCost: number;
            if (manual_cost && String(manual_cost).trim() !== '') {
                totalCost = Number(manual_cost);
            } else {
                totalCost = costFilament + costEnergy;
            }

            // Calculate started_at based on elapsed time for In Progress
            const isInProgress = status === 'In Progress';
            let startedAt = printJob.started_at;

            if (isInProgress && elapsed_minutes) {
                const elapsedMs = Number(elapsed_minutes) * 60 * 1000;
                startedAt = new Date(Date.now() - elapsedMs);
            } else if (!isInProgress) {
                startedAt = null;
            }

            // Build update object
            const updateData: any = {
                name,
                duration_minutes: durationMins,
                filament_used_g: weightUsed,
                calculated_cost_filament: Number(totalCost.toFixed(2)),
                calculated_cost_energy: Number(costEnergy.toFixed(2)),
                status,
                started_at: startedAt,
                date: date ? new Date(date as string) : printJob.date
            };

            // Update printer/spool if provided
            if (printer_id) {
                updateData.printer_id = printer_id;
            }
            if (spool_id) {
                updateData.spool_id = spool_id;
            }
            // Handle STL file: update if new one provided, or remove if requested
            if (stl_file) {
                // If replacing an existing model, delete the old file
                if (printJob.stl_file) {
                    const oldFilePath = path.join('static', printJob.stl_file);
                    if (existsSync(oldFilePath)) {
                        try {
                            await unlink(oldFilePath);
                        } catch (e) {
                            console.error('Failed to delete old model file:', e);
                        }
                    }
                }
                updateData.stl_file = stl_file;
            } else if (remove_model === 'true' && printJob.stl_file) {
                // Delete the file from disk
                const filePath = path.join('static', printJob.stl_file);
                if (existsSync(filePath)) {
                    try {
                        await unlink(filePath);
                    } catch (e) {
                        console.error('Failed to delete model file:', e);
                    }
                }
                updateData.stl_file = null;
            }

            await PrintJob.findOneAndUpdate(
                { _id: id, user_id: locals.user.id },
                updateData
            );

            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true });
        }
    },

    delete: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });

        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return fail(400, { missing: true });

        await connectDB();

        try {
            // Find the print first to get the model file path
            const printJob = await PrintJob.findOne({ _id: id, user_id: locals.user.id });

            if (printJob?.stl_file) {
                // Delete the model file from disk
                const filePath = path.join('static', printJob.stl_file);
                if (existsSync(filePath)) {
                    try {
                        await unlink(filePath);
                    } catch (e) {
                        console.error('Failed to delete model file:', e);
                    }
                }
            }

            await PrintJob.findOneAndDelete({ _id: id, user_id: locals.user.id });
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true });
        }
    },

    duplicate: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });

        const formData = await request.formData();
        const id = formData.get('id');

        if (!id) return fail(400, { missing: true });

        await connectDB();

        try {
            // Find the original print with populated spool and printer
            const original = await PrintJob.findOne({ _id: id, user_id: locals.user.id })
                .populate('spool_id')
                .populate('printer_id');
            if (!original) return fail(404, { notFound: true });

            // Get user's electricity rate
            const user = await User.findById(locals.user.id);
            const electricityRate = user?.electricity_rate || 0.12;

            // Recalculate costs based on current spool prices
            let costFilament = 0;
            let costEnergy = 0;
            const spool = original.spool_id as any;
            const printer = original.printer_id as any;

            if (spool?.price && spool?.weight_initial_g && original.filament_used_g) {
                costFilament = (spool.price / spool.weight_initial_g) * original.filament_used_g;
            }

            if (printer?.power_consumption_watts && original.duration_minutes) {
                const powerKw = printer.power_consumption_watts / 1000;
                const durationHours = original.duration_minutes / 60;
                costEnergy = powerKw * durationHours * electricityRate;
            }

            const totalCost = costFilament + costEnergy;

            // Create a new print with the same details
            await PrintJob.create({
                user_id: locals.user.id,
                name: original.name,
                printer_id: original.printer_id?._id || original.printer_id,
                spool_id: original.spool_id?._id || original.spool_id,
                duration_minutes: original.duration_minutes,
                filament_used_g: original.filament_used_g,
                calculated_cost_filament: Number(totalCost.toFixed(2)),
                calculated_cost_energy: Number(costEnergy.toFixed(2)),
                status: 'Success',
                stl_file: original.stl_file,
                date: new Date()
            });

            // Deduct filament from spool for the new print
            if (spool && original.filament_used_g) {
                spool.weight_remaining_g = Math.max(0, spool.weight_remaining_g - original.filament_used_g);
                await spool.save();
            }

            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true });
        }
    }
};
