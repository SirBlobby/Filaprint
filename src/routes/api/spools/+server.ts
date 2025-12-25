import { json } from '@sveltejs/kit';
import { Spool } from '$lib/models/Spool';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    try {
        const spools = await Spool.find({ is_active: true }).sort({ createdAt: -1 });
        return json(spools);
    } catch (error) {
        return json({ error: 'Failed to fetch spools' }, { status: 500 });
    }
};

export const POST: RequestHandler = async ({ request }) => {
    try {
        const data = await request.json();
        
        // Basic validation could go here, but Mongoose validation handles most
        const newSpool = await Spool.create(data);
        
        return json(newSpool, { status: 201 });
    } catch (error) {
        console.error('Create Spool Error:', error);
        return json({ error: 'Failed to create spool' }, { status: 400 });
    }
};
