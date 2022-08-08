import { Request, Response } from 'express';
import moment from 'moment';
import mongoose from 'mongoose';
import Employee from '../models/employee';
import Paidleaves from '../models/paidleave';
import Attendance from '../models/attendance';

export async function create(req: Request, res: Response) {
	const { date, describe } = req.body;

	const user = await Employee.findOne({ _id: res.locals.user.uid });
	//@ts-ignore
	const files = req.files!.map((x: any) => ({ url: x.path, name: x.originalname }));
	await new Paidleaves({
		employee: res.locals.user.uid,
		department: user?.department,
		date,
		describe,
		files,
	}).save();

	res.json({ msg: 'ok' });
}
export async function approve(req: Request, res: Response) {
	const { id } = req.params;
	const paidleave = await Paidleaves.findOne({ _id: id });
	await paidleave?.update({ state: 'approve' });

	const today = moment(paidleave?.date).startOf('day');

	await Attendance.findOneAndUpdate(
		{
			employee: paidleave?.employee,
			at: { $gte: today.toDate(), $lt: moment(today).endOf('day') },
		},
		{
			roll: 1,
		}
	);

	res.json({ msg: 'ok' });
}
export async function reject(req: Request, res: Response) {
	const { id } = req.params;
	const ot = await Paidleaves.findOne({ _id: id });
	await ot?.update({ state: 'reject' });

	res.json({ msg: 'ok' });
}
export async function getList(req: Request, res: Response) {
	const { isLeader } = req.params;

	let otList: any = null;

	if (isLeader) {
		const user = await Employee.aggregate([
			{
				$match: { _id: new mongoose.Types.ObjectId(res.locals.user.uid) },
			},
			{
				$lookup: {
					from: 'departments',
					localField: '_id',
					foreignField: 'leader',
					as: 'leader',
				},
			},
		]);
		if (user[0].leader[0]) {
			otList = await Paidleaves.find({ department: user[0].leader[0]._id });
		}
	} else {
		// const user = await Employee.findOne({ _id: res.locals.user.uid });
		// if (user) otList = await Paidleaves.find({ department: user?.department });
		otList = await Paidleaves.find({ employee: res.locals.user.uid });
	}

	res.json(otList);
}
