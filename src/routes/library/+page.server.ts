import { PrintJob } from '$lib/models/PrintJob';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { statSync, existsSync } from 'fs';
import path from 'path';

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

    // Add file sizes to each model
    const modelsWithSizes = printsWithSTL.map(print => {
        let fileSize = 0;
        if (print.stl_file) {
            try {
                const filePath = path.join('static', print.stl_file);
                if (existsSync(filePath)) {
                    const stats = statSync(filePath);
                    fileSize = stats.size;
                }
            } catch (e) {
                // Ignore file read errors
            }
        }
        return {
            ...print,
            fileSize
        };
    });

    // Calculate total storage
    const totalStorage = modelsWithSizes.reduce((sum, m) => sum + m.fileSize, 0);

    return {
        models: JSON.parse(JSON.stringify(modelsWithSizes)),
        totalStorage
    };
};
