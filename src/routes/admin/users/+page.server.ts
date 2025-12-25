import { User } from '$lib/models/User';
import { connectDB } from '$lib/server/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    await connectDB();
    const users = await User.find({}).sort({ createdAt: -1 }).lean();
    return {
        users: JSON.parse(JSON.stringify(users))
    };
};
