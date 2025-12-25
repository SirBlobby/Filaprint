import { PrintJob } from '$lib/models/PrintJob';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    await connectDB();
    
    // Fetch all prints for aggregation - filtered by user
    const prints = await PrintJob.find({ user_id: locals.user.id })
        .populate('spool_id', 'color_hex material')
        .populate('printer_id', 'power_consumption_watts')
        .sort({ date: 1 })
        .lean();

    // 1. Success vs Fail
    let successCount = 0;
    let failCount = 0;
    
    // 2. Material Usage (Map: Material -> Weight)
    const materialUsage: Record<string, number> = {};

    // 3. Usage Over Time (Last 30 days)
    const usageByDate: Record<string, number> = {};

    // 4. Electricity Usage Over Time (Wh)
    const electricityByDate: Record<string, number> = {};
    let totalElectricity = 0;

    prints.forEach(print => {
        // Status
        if (print.status === 'Success') successCount++;
        else if (print.status === 'Fail') failCount++;

        // Material
        if (print.spool_id?.material) {
            const mat = print.spool_id.material;
            materialUsage[mat] = (materialUsage[mat] || 0) + print.filament_used_g;
        }

        // Timeline - Filament
        const dateKey = new Date(print.date).toISOString().split('T')[0];
        usageByDate[dateKey] = (usageByDate[dateKey] || 0) + print.filament_used_g;

        // Electricity: Power (W) × Duration (hours) = Wh
        const powerWatts = print.printer_id?.power_consumption_watts || 0;
        const durationHours = (print.duration_minutes || 0) / 60;
        const wattHours = powerWatts * durationHours;
        
        electricityByDate[dateKey] = (electricityByDate[dateKey] || 0) + wattHours;
        totalElectricity += wattHours;
    });

    return {
        analytics: {
            successRate: { success: successCount, fail: failCount },
            materialUsage,
            usageByDate,
            electricityByDate,
            totalElectricity: (totalElectricity / 1000).toFixed(2) // Convert to kWh
        }
    };
};
