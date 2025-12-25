import { PrintJob } from '$lib/models/PrintJob';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    await connectDB();
    
    // Get all prints with STL files
    const printsWithSTL = await PrintJob.find({ 
        user_id: locals.user.id,
        stl_file: { $exists: true, $nin: [null, ''] }
    })
    .sort({ date: -1 })
    .lean();

    return {
        models: JSON.parse(JSON.stringify(printsWithSTL))
    };
};
