import { Printer } from '$lib/models/Printer';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    await connectDB();
    const printers = await Printer.find({ user_id: locals.user.id }).sort({ name: 1 }).lean();
    return {
        printers: JSON.parse(JSON.stringify(printers))
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });
        
        const formData = await request.formData();
        const name = formData.get('name');
        const model = formData.get('model');
        const watts = formData.get('power_consumption_watts');
        const nozzle = formData.get('nozzle_diameter_mm');
        
        if (!name) return fail(400, { missing: true });

        await connectDB();
        
        try {
            await Printer.create({
                user_id: locals.user.id,
                name,
                model,
                power_consumption_watts: watts ? Number(watts) : 0,
                nozzle_diameter_mm: nozzle ? Number(nozzle) : 0.4
            });
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
        const model = formData.get('model');
        const watts = formData.get('power_consumption_watts');
        const nozzle = formData.get('nozzle_diameter_mm');

        if (!id || !name) return fail(400, { missing: true });

        await connectDB();

        try {
            await Printer.findOneAndUpdate(
                { _id: id, user_id: locals.user.id },
                {
                    name,
                    model,
                    power_consumption_watts: watts ? Number(watts) : 0,
                    nozzle_diameter_mm: nozzle ? Number(nozzle) : 0.4
                }
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
            await Printer.findOneAndDelete({ _id: id, user_id: locals.user.id });
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true });
        }
    }
};
