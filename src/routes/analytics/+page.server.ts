import { PrintJob } from '$lib/models/PrintJob';
import { Printer } from '$lib/models/Printer';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { statSync, existsSync } from 'fs';
import path from 'path';

export const load: PageServerLoad = async ({ locals, url }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    await connectDB();
    
    // Get time range from URL param (default: 30 days)
    const range = url.searchParams.get('range') || '30';
    let dateFilter: Date | null = null;
    
    if (range !== 'all') {
        const days = parseInt(range);
        dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - days);
    }
    
    // Build query with optional date filter
    const query: any = { user_id: locals.user.id };
    if (dateFilter) {
        query.date = { $gte: dateFilter };
    }
    
    // Fetch all prints for aggregation
    const prints = await PrintJob.find(query)
        .populate('spool_id', 'color_hex material brand')
        .populate('printer_id', 'power_consumption_watts name')
        .sort({ date: 1 })
        .lean();

    // Get all printers for the user
    const printers = await Printer.find({ user_id: locals.user.id }).lean();

    // 1. Success vs Fail vs Cancelled
    let successCount = 0;
    let failCount = 0;
    let cancelledCount = 0;
    let inProgressCount = 0;
    
    // 2. Material Usage (Map: Material -> Weight)
    const materialUsage: Record<string, number> = {};

    // 3. Usage Over Time
    const usageByDate: Record<string, number> = {};

    // 4. Electricity Usage Over Time (Wh)
    const electricityByDate: Record<string, number> = {};
    let totalElectricity = 0;

    // 5. Cost tracking
    const costByDate: Record<string, number> = {};
    let totalCost = 0;
    let totalFilamentCost = 0;
    let totalEnergyCost = 0;

    // 6. Print time tracking
    let totalPrintTime = 0;
    
    // 7. Printer usage (how many prints per printer)
    const printerUsage: Record<string, { name: string; count: number; time: number }> = {};

    // 8. Total filament used
    let totalFilamentUsed = 0;

    // 9. Prints with 3D models count
    let printsWithModels = 0;
    let totalModelSize = 0; // Total file size of all models in bytes

    // 10. Top printed models
    const modelCounts: Record<string, number> = {};

    prints.forEach(print => {
        // Status
        if (print.status === 'Success') successCount++;
        else if (print.status === 'Fail') failCount++;
        else if (print.status === 'Cancelled') cancelledCount++;
        else if (print.status === 'In Progress') inProgressCount++;

        // Material
        if (print.spool_id?.material) {
            const mat = print.spool_id.material;
            materialUsage[mat] = (materialUsage[mat] || 0) + (print.filament_used_g || 0);
        }

        // Timeline - Filament
        const dateKey = new Date(print.date).toISOString().split('T')[0];
        usageByDate[dateKey] = (usageByDate[dateKey] || 0) + (print.filament_used_g || 0);

        // Electricity: Power (W) × Duration (hours) = Wh
        const powerWatts = (print.printer_id as any)?.power_consumption_watts || 0;
        const durationHours = (print.duration_minutes || 0) / 60;
        const wattHours = powerWatts * durationHours;
        
        electricityByDate[dateKey] = (electricityByDate[dateKey] || 0) + wattHours;
        totalElectricity += wattHours;

        // Cost
        const printCost = print.calculated_cost_filament || 0;
        const energyCost = print.calculated_cost_energy || 0;
        costByDate[dateKey] = (costByDate[dateKey] || 0) + printCost;
        totalCost += printCost;
        totalFilamentCost += (printCost - energyCost);
        totalEnergyCost += energyCost;

        // Print time
        totalPrintTime += print.duration_minutes || 0;

        // Printer usage
        const printerId = (print.printer_id as any)?._id?.toString() || 'unknown';
        const printerName = (print.printer_id as any)?.name || 'Unknown';
        if (!printerUsage[printerId]) {
            printerUsage[printerId] = { name: printerName, count: 0, time: 0 };
        }
        printerUsage[printerId].count++;
        printerUsage[printerId].time += print.duration_minutes || 0;

        // Filament total
        totalFilamentUsed += print.filament_used_g || 0;

        // 3D models
        if (print.stl_file) {
            printsWithModels++;
            modelCounts[print.name] = (modelCounts[print.name] || 0) + 1;
            
            // Get file size
            try {
                const filePath = path.join('static', print.stl_file);
                if (existsSync(filePath)) {
                    const stats = statSync(filePath);
                    totalModelSize += stats.size;
                }
            } catch (e) {
                // Ignore file read errors
            }
        }
    });

    // Sort top models by count
    const topModels = Object.entries(modelCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

    // Calculate averages
    const completedPrints = successCount + failCount;
    const avgPrintTime = completedPrints > 0 ? totalPrintTime / completedPrints : 0;
    const avgCost = completedPrints > 0 ? totalCost / completedPrints : 0;
    const avgFilament = completedPrints > 0 ? totalFilamentUsed / completedPrints : 0;

    // Convert printer usage to array and sort
    const printerStats = Object.values(printerUsage)
        .sort((a, b) => b.count - a.count);

    return {
        analytics: {
            successRate: { 
                success: successCount, 
                fail: failCount, 
                cancelled: cancelledCount,
                inProgress: inProgressCount 
            },
            materialUsage,
            usageByDate,
            electricityByDate,
            costByDate,
            totalElectricity: (totalElectricity / 1000).toFixed(2),
            totalCost: totalCost.toFixed(2),
            totalFilamentCost: totalFilamentCost.toFixed(2),
            totalEnergyCost: totalEnergyCost.toFixed(2),
            totalPrintTime,
            totalFilamentUsed: Math.round(totalFilamentUsed),
            avgPrintTime: Math.round(avgPrintTime),
            avgCost: avgCost.toFixed(2),
            avgFilament: Math.round(avgFilament),
            printerStats,
            printsWithModels,
            totalModelSize,
            topModels,
            totalPrints: prints.length,
            range
        }
    };
};
