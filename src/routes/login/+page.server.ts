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
    login: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = data.get('username') as string;
        const password = data.get('password') as string;

        if (!username || !password) {
            return fail(400, { missing: true });
        }

        await connectDB();
        
        const user = await User.findOne({ username });
        if (!user) {
            return fail(400, { invalid: true });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return fail(400, { invalid: true });
        }

        const token = jwt.sign({ id: user._id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

        cookies.set('session', token, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });

        throw redirect(303, '/');
    }
};
