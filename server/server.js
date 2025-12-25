import { handler } from '../build/handler.js';
import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';

dotenv.config();

const app = express();
const server = http.Server(app);

app.use(cors());

// Connect to Database
connectDB();

app.use(handler);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('listening on port http://localhost:' + PORT);
});