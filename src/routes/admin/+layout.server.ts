import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
    if (!locals.user || locals.user.role !== 'Admin') {
        throw redirect(303, '/');
    }
    return {};
};
