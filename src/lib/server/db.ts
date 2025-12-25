import mongoose from 'mongoose';
import { env } from '$env/dynamic/private';

const MONGODB_URI = env.MONGODB_URI || 'mongodb://localhost:27017/filaprint';

export const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) {
        return;
    }

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('MongoDB connected successfully via SvelteKit');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};
