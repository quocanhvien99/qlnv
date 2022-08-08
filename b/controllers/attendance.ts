import { Request, Response } from 'express';
import moment from 'moment';
import mongoose from 'mongoose';
import Attendance from '../models/attendance';

export async function checkin(req: Request, res: Response) {
	const { at } = req.body;

	const today = moment(at).startOf('day');

	const checkExist = await Attendance.findOne({
		employee: res.locals.user.uid,
		at: { $gte: today.toDate(), $lt: moment(today).endOf('day') },
	});
	if (checkExist) {
		return res.json({ msg: 'Đã chấm công hôm nay.' });
	}

	let start = moment(today);
	start.hour(8);
	let afterLunch = moment(today);
	afterLunch.hour(14);

	let late = moment(at).diff(start, 'minute'); //in minute
	if (late < 0) late = 0;

	let roll = 1;
	if (late) {
		if (moment(at).diff(afterLunch) <= 0) {
			roll = 0.5;
		} else {
			roll = 0;
		}
	}

	const saved = await new Attendance({ at, late, roll, employee: res.locals.user.uid }).save();

	res.json({ saved });
}

export async function getAttendanceList(req: Request, res: Response) {
	const data: any = await Attendance.aggregate([
		{ $match: { employee: new mongoose.Types.ObjectId(res.locals.user.uid) } },
		{ $sort: { at: -1 } },
		{ $limit: 31 },
		{ $project: { employee: 0 } },
	]);
	res.json(data);
}
