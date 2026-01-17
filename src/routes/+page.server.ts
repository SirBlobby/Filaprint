import { Spool } from '$lib/models/Spool';
import { Printer } from '$lib/models/Printer';
import { PrintJob } from '$lib/models/PrintJob';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');

    await connectDB();

    const userId = locals.user.id;

    // Run in parallel - all filtered by user
    const [spoolCount, spools, printerCount, recentPrints, activePrinter, printers, activePrintJob, completedPrints] = await Promise.all([
        Spool.countDocuments({ user_id: userId, is_active: true }),
        Spool.find({ user_id: userId, is_active: true }).lean(),
        Printer.countDocuments({ user_id: userId }),
        PrintJob.find({ user_id: userId }).sort({ date: -1, _id: -1 }).limit(5).populate('printer_id', 'name').populate('spool_id', 'brand color_hex').lean(),
        Printer.findOne({ user_id: userId }).lean(),
        Printer.find({ user_id: userId }).lean(), // Fetch all printers for dropdowns
        PrintJob.findOne({ user_id: userId, status: 'In Progress' }).populate('printer_id', 'name').populate('spool_id', 'brand color_hex material').lean(),
        PrintJob.find({ user_id: userId, status: { $ne: 'In Progress' } }).select('calculated_cost_filament').lean()
    ]);

    // Calculate totals
    let totalWeightG = 0;
    let totalValue = 0;

    spools.forEach(spool => {
        totalWeightG += (spool.weight_remaining_g || 0);

        // Value = (Remaining / Initial) * Price
        if (spool.weight_initial_g > 0 && spool.price > 0) {
            const ratio = (spool.weight_remaining_g || 0) / spool.weight_initial_g;
            totalValue += (ratio * spool.price);
        }
    });

    // Calculate total spent on prints
    let totalSpent = 0;
    completedPrints.forEach(print => {
        totalSpent += (print.calculated_cost_filament || 0);
    });

    // Keep grams for precision, format for display
    const totalWeightKg = totalWeightG >= 1000
        ? (totalWeightG / 1000).toFixed(2)
        : (totalWeightG / 1000).toFixed(3);
    const estimatedValue = totalValue.toFixed(2);

    return {
        stats: {
            spoolCount,
            totalWeightKg,
            totalWeightG,
            printerCount,
            estimatedValue,
            totalSpent: totalSpent.toFixed(2)
        },
        recentPrints: JSON.parse(JSON.stringify(recentPrints)),
        activePrinter: activePrinter ? JSON.parse(JSON.stringify(activePrinter)) : null,
        activePrintJob: activePrintJob ? JSON.parse(JSON.stringify(activePrintJob)) : null,
        spools: JSON.parse(JSON.stringify(spools)),
        printers: JSON.parse(JSON.stringify(printers))
    };
};
