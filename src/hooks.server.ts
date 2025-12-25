import { connectDB } from '$lib/server/db';
import { User } from '$lib/models/User';
import type { Handle } from '@sveltejs/kit';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_change_me';

export const handle: Handle = async ({ event, resolve }) => {
    // 1. Connect to DB on every request (ensure connection)
    await connectDB();

    // 2. Auth Check
    const token = event.cookies.get('session');
    
    if (token) {
        try {
            const decoded = jwt.verify(token, JWT_SECRET) as { id: string; username: string; role: string };
            // Optional: Fetch full user if needed, but token payload is faster
            event.locals.user = { id: decoded.id, username: decoded.username, role: decoded.role };
        } catch (err) {
            // Invalid token
            event.cookies.delete('session', { path: '/' });
            event.locals.user = null;
        }
    } else {
        event.locals.user = null;
    }

    // 3. Route Protection
    if (!event.locals.user) {
        if (!event.url.pathname.startsWith('/login') && !event.url.pathname.startsWith('/register')) {
             return new Response('Redirect', { status: 303, headers: { Location: '/login' } });
        }
    } else {
        // If logged in and trying to go to login/register, redirect to dashboard
        if (event.url.pathname.startsWith('/login') || event.url.pathname.startsWith('/register')) {
            return new Response('Redirect', { status: 303, headers: { Location: '/' } });
        } 
    }

    const response = await resolve(event);
    return response;
};
