import { Request, Response } from 'express';
import moment from 'moment';
import mongoose from 'mongoose';
import Employee from '../models/employee';
import Ot from '../models/ot';
import Attendance from '../models/attendance';

export async function create(req: Request, res: Response) {
	const { to, describe } = req.body;

	const user = await Employee.findOne({ _id: res.locals.user.uid });
	await new Ot({ employee: res.locals.user.uid, department: user?.department, to, describe }).save();

	res.json({ msg: 'ok' });
}
export async function approve(req: Request, res: Response) {
	const { id } = req.params;
	const ot = await Ot.findOne({ _id: id });

	const endday = moment(ot?.to).hour(18).minute(0).second(0);
	const overtime = Math.abs(Math.round(moment(ot?.to).diff(endday, 'minute') / 60));
	const incRoll = overtime * 0.2;

	const today = moment(ot?.to).startOf('day');

	await Attendance.findOneAndUpdate(
		{
			employee: ot?.employee,
			at: { $gte: today.toDate(), $lt: moment(today).endOf('day') },
		},
		{
			$inc: { roll: incRoll },
		}
	);
	await ot?.update({ state: 'approve' });

	res.json({ msg: 'ok' });
}
export async function reject(req: Request, res: Response) {
	const { id } = req.params;
	const ot = await Ot.findOne({ _id: id });
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
			otList = await Ot.find({ department: user[0].leader[0]._id });
		}
	} else {
		const user = await Employee.findOne({ _id: res.locals.user.uid });
		if (user) otList = await Ot.find({ department: user?.department });
	}

	res.json(otList);
}
