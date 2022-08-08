import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import Employee from '../models/employee';
import Department from '../models/department';
import { Redis } from 'ioredis';
import mongoose from 'mongoose';

//auth
export async function register(req: Request, res: Response) {
	let { email, password } = req.body;

	const emailExist = await Employee.findOne({ email });
	if (emailExist) return res.status(400).send('Email đã tồn tại');

	const hashedPassword = await bcrypt.hash(password, 10);

	const user = new Employee({
		email,
		password: hashedPassword,
	});
	try {
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (err) {
		res.status(400).send(err);
	}
}
export async function login(req: Request, res: Response) {
	let { email, password } = req.body;

	let user = (
		await Employee.aggregate([
			{ $match: { email } },
			{
				$lookup: {
					from: 'departments',
					localField: 'department',
					foreignField: '_id',
					as: 'department',
				},
			},
			{ $addFields: { department: { $first: '$department' } } },
			{
				$lookup: {
					from: 'departments',
					localField: '_id',
					foreignField: 'leader',
					as: 'leader',
				},
			},
			{ $addFields: { leader: { $first: '$leader' } } },
		])
	)[0];
	let errorMsg = 'Tài khoản hoặc mật khẩu không chính xác!';
	if (!user) return res.status(400).json({ msg: errorMsg });
	console.log('email, password');
	if (!bcrypt.compareSync(password, user.password as string)) return res.status(400).json({ msg: errorMsg });

	const accessToken = jwt.sign({ uid: user._id }, process.env.ACCESS_TOKEN_SECRET!, {
		expiresIn: '1m',
	});
	const refreshToken = jwt.sign({ uid: user._id }, process.env.ACCESS_TOKEN_SECRET!);

	const redisClient = req.app.locals.redisClient as Redis;
	redisClient.rpush('refreshTokens', refreshToken);

	res.cookie('token', accessToken).cookie('refreshToken', refreshToken).json({ msg: 'ok', user });
}
export async function logout(req: Request, res: Response) {
	const { refreshToken } = req.body;
	const redisClient = req.app.locals.redisClient as Redis;
	const result = await redisClient.lrem('refreshTokens', 0, refreshToken);
	res.clearCookie('token').clearCookie('refreshToken').json({ msg: 'ok' });
}
export async function getToken(req: Request, res: Response) {
	//const { refreshToken } = req.body;
	const { refreshToken } = req.cookies;
	if (!refreshToken) return res.sendStatus(401);

	const redisClient = req.app.locals.redisClient as Redis;
	const check = await redisClient.lpos('refreshTokens', refreshToken);
	if (!check) return res.sendStatus(401);

	//@ts-ignore
	jwt.verify(refreshToken, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
		if (err) return res.status(403).json({ msg: 'Invalid token' });
		const accessToken = jwt.sign({ uid: user.uid }, process.env.ACCESS_TOKEN_SECRET!, {
			expiresIn: '15m',
		});
		res
			.cookie('token', accessToken, {
				expires: new Date(15 * 60 * 1000 + Date.now()),
			})
			.json({ msg: 'ok' });
	});
}
export async function info(req: Request, res: Response) {
	const uid = res.locals.user.uid;
	const user = await Employee.findById(uid);

	res.json(user);
}

//employee
export async function newEmployee(req: Request, res: Response) {
	let { email, password } = req.body;

	if (!email || !password) return res.status(400).json({ msg: 'Thiếu trường dữ liệu' });

	const emailExist = await Employee.findOne({ email });
	if (emailExist) return res.status(400).json({ msg: 'Email đã tồn tại' });

	const hashedPassword = await bcrypt.hash(password, 10);

	let data = req.body;
	if (req.file) data.avatar = req.file.path;

	const employee = new Employee({
		...data,
		password: hashedPassword,
	});
	try {
		const savedEmployee = await employee.save();
		res.json(savedEmployee);
	} catch (err) {
		res.status(400).json(err);
	}
}
export async function getEmployeeList(req: Request, res: Response) {
	let { limit, skip, sortBy, orderBy, keyword, department } = req.query;
	let query: any = {};
	let sort: any = { first_day_work: -1 };
	if (keyword) {
		const regex = new RegExp(escapeRegex(keyword as string), 'gi');
		query.full_name = regex;
	}
	if (sortBy) {
		sort = {};
		sort[sortBy.toString()] = parseInt(orderBy as string);
	}
	if (sortBy == 'department') {
		sort = {};
		sort['department.departmentName'] = parseInt(orderBy as string);
	}
	if (!skip) skip = '0';
	if (!limit) limit = '20';

	let data: any = await Employee.aggregate([
		{
			$lookup: {
				from: 'departments',
				localField: 'department',
				foreignField: '_id',
				as: 'department',
			},
		},
		{ $match: query },
		{
			$facet: {
				list: [
					{ $sort: sort },
					{ $skip: parseInt(skip as string) },
					{ $limit: parseInt(limit as string) },
					{ $project: { password: 0 } },
				],
				totalCount: [{ $count: 'count' }],
			},
		},
	]);

	data = { list: data[0].list, count: data[0].totalCount[0]?.count };
	res.json(data);
}
export async function getEmployee(req: Request, res: Response) {
	const { id } = req.params;
	let _id: any;
	try {
		_id = new mongoose.Types.ObjectId(id);
	} catch (err) {
		return res.status(400).json({ msg: 'Thành viên không tồn tại' });
	}
	let data = await Employee.aggregate([
		{ $match: { _id } },
		{
			$lookup: {
				from: 'departments',
				localField: 'department',
				foreignField: '_id',
				as: 'department',
			},
		},
		{ $project: { password: 0 } },
	]);
	if (data.length == 0) return res.status(400).json({ msg: 'Thành viên không tồn tại' });
	res.json(data[0]);
}
export async function updateEmployee(req: Request, res: Response) {
	let data = req.body;
	if (req.file) data.avatar = req.file.path;
	if (data.department) data.department = new mongoose.Types.ObjectId(data.deleteDepartment);

	const updated = await Employee.findOneAndUpdate({ _id: req.params.id }, data, { new: true });
	res.json(updated);
}
export async function deleteEmployee(req: Request, res: Response) {
	const { id } = req.params;
	Employee.deleteOne({ _id: id }).then((result) => res.json(result));
}

function escapeRegex(text: string) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
