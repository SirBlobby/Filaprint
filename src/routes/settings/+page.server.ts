import { connectDB } from '$lib/server/db';
import { User } from '$lib/models/User';
import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import bcrypt from 'bcryptjs';

export const load: PageServerLoad = async ({ locals }) => {
    if (!locals.user) throw redirect(303, '/login');
    
    await connectDB();
    
    const user = await User.findById(locals.user.id).select('-password').lean();
    
    return {
        userProfile: JSON.parse(JSON.stringify(user))
    };
};

export const actions: Actions = {
    updateProfile: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });
        
        const formData = await request.formData();
        const username = formData.get('username');
        const location = formData.get('location');
        const electricity_rate = formData.get('electricity_rate');

        if (!username) {
            return fail(400, { missing: true, message: 'Username is required' });
        }

        await connectDB();

        try {
            // Check if username is taken by another user
            const existingUser = await User.findOne({ 
                username, 
                _id: { $ne: locals.user.id } 
            });
            
            if (existingUser) {
                return fail(400, { taken: true, message: 'Username already taken' });
            }

            await User.findByIdAndUpdate(locals.user.id, {
                username,
                location: location || '',
                electricity_rate: electricity_rate ? Number(electricity_rate) : 0.12
            });

            return { success: true, message: 'Profile updated successfully' };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true, message: 'Failed to update profile' });
        }
    },

    changePassword: async ({ request, locals }) => {
        if (!locals.user) return fail(401, { unauthorized: true });
        
        const formData = await request.formData();
        const currentPassword = formData.get('currentPassword') as string;
        const newPassword = formData.get('newPassword') as string;
        const confirmPassword = formData.get('confirmPassword') as string;

        if (!currentPassword || !newPassword || !confirmPassword) {
            return fail(400, { missing: true, message: 'All password fields are required' });
        }

        if (newPassword !== confirmPassword) {
            return fail(400, { mismatch: true, message: 'New passwords do not match' });
        }

        if (newPassword.length < 6) {
            return fail(400, { weak: true, message: 'Password must be at least 6 characters' });
        }

        await connectDB();

        try {
            const user = await User.findById(locals.user.id);
            if (!user) return fail(404, { notFound: true });

            const validPassword = await bcrypt.compare(currentPassword, user.password);
            if (!validPassword) {
                return fail(400, { invalid: true, message: 'Current password is incorrect' });
            }

            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
            await user.save();

            return { passwordChanged: true, message: 'Password changed successfully' };
        } catch (error) {
            console.error(error);
            return fail(500, { dbError: true, message: 'Failed to change password' });
        }
    }
};
