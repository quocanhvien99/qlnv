import express from 'express';
import cors from 'cors';
import Redis from 'ioredis';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import 'dotenv/config';

import employeeRoute from './routes/employee';
import authRoute from './routes/user';
import departmentRoute from './routes/department';
import attendanceRoute from './routes/attendance';
import protectedRoute from './Middleware/protectedRoute';

mongoose.connect(process.env.MONGO_URI!);
const db = mongoose.connection;
db.once('open', () => {
	console.log('Mongodb connected');
});

const app = express();

app.locals.redisClient = new Redis();

app.use(cors({ origin: 'http://localhost:3001', credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/auth', authRoute);
app.use('/employee', employeeRoute);
app.use('/department', departmentRoute);
app.use('/attendance', protectedRoute, attendanceRoute);

app.listen(process.env.PORT || 3000);
