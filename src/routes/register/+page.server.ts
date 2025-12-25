import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { User } from '$lib/models/User';
import { connectDB } from '$lib/server/db';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) throw redirect(303, '/');
    return {};
};

export const actions: Actions = {
    register: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;
        const confirmPassword = data.get('confirmPassword') as string;

        if (!username || !password || !confirmPassword) {
            return fail(400, { missing: true });
        }

        if (password !== confirmPassword) {
            return fail(400, { mismatch: true });
        }

        if (password.length < 6) {
           return fail(400, { weak: true });
        }

        await connectDB();
        
        const existing = await User.findOne({ username });
        if (existing) {
            return fail(400, { exists: true });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            // First user becomes Admin
            const userCount = await User.countDocuments({});
            const role = userCount === 0 ? 'Admin' : 'Maker';

            const user = await User.create({
                username,
                password: hashedPassword,
                role
            });

            const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

            cookies.set('session', token, {
                path: '/',
                httpOnly: true,
                sameSite: 'strict',
                secure: process.env.NODE_ENV === 'production',
                maxAge: 60 * 60 * 24 * 7
            });

        } catch (error) {
            console.error(error);
            return fail(500, { error: true });
        }

        throw redirect(303, '/');
    }
};
