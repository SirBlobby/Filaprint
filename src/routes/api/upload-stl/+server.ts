import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const UPLOAD_DIR = 'static/uploads/models';
const ALLOWED_EXTENSIONS = ['.stl', '.obj'];

export const POST: RequestHandler = async ({ request, locals }) => {
    if (!locals.user) {
        throw error(401, 'Unauthorized');
    }

    const formData = await request.formData();
    const file = formData.get('stl') as File; // Keep 'stl' for backward compatibility

    if (!file || file.size === 0) {
        throw error(400, 'No file provided');
    }

    // Validate file type
    const fileName = file.name.toLowerCase();
    const extension = '.' + fileName.split('.').pop();
    
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
        throw error(400, 'Only STL and OBJ files are allowed');
    }

    // Create upload directory if it doesn't exist
    if (!existsSync(UPLOAD_DIR)) {
        await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${locals.user.id}_${timestamp}_${sanitizedName}`;
    const filePath = path.join(UPLOAD_DIR, uniqueFileName);

    // Write file to disk
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    // Return the public path
    const publicPath = `/uploads/models/${uniqueFileName}`;

    return json({ 
        success: true, 
        path: publicPath,
        fileName: file.name,
        fileType: extension.slice(1).toUpperCase()
    });
};
