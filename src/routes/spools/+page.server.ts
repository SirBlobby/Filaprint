import { Spool } from '$lib/models/Spool';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    await connectDB();
    // Filter by user_id
    const spools = await Spool.find({ user_id: locals.user.id, is_active: true }).sort({ createdAt: -1 }).lean();
    
    return {
        spools: JSON.parse(JSON.stringify(spools))
    };
};

export const actions: Actions = {
    create: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });
        
        const formData = await request.formData();
        const brand = formData.get('brand');
        const material = formData.get('material');
        const color_hex = formData.get('color_hex');
        const weight_initial_g = formData.get('weight_initial_g');
        const weight_remaining_g = formData.get('weight_remaining_g');
        const price = formData.get('price');
        
        if (!brand || !material || !weight_initial_g) {
            return fail(400, { missing: true });
        }

        await connectDB();

        try {
            await Spool.create({
                user_id: locals.user.id,
                brand,
                material,
                color_hex,
                weight_initial_g: Number(weight_initial_g),
                weight_remaining_g: Number(weight_remaining_g || weight_initial_g),
                price: price ? Number(price) : 0
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
        const brand = formData.get('brand');
        const material = formData.get('material');
        const color_hex = formData.get('color_hex');
        const weight_initial_g = formData.get('weight_initial_g');
        const weight_remaining_g = formData.get('weight_remaining_g');
        const price = formData.get('price');
        
        if (!id || !brand || !material || !weight_initial_g) {
            return fail(400, { missing: true });
        }

        await connectDB();

        try {
            const result = await Spool.findOneAndUpdate(
                { _id: id, user_id: locals.user.id },
                {
                    brand,
                    material,
                    color_hex,
                    weight_initial_g: Number(weight_initial_g),
                    weight_remaining_g: Number(weight_remaining_g),
                    price: price ? Number(price) : 0
                }
            );
            if (!result) return fail(404, { notFound: true });
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
            // Soft delete by setting is_active to false
            const result = await Spool.findOneAndUpdate(
                { _id: id, user_id: locals.user.id },
                { is_active: false }
            );
            if (!result) return fail(404, { notFound: true });
            return { success: true };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true });
        }
    }
};
