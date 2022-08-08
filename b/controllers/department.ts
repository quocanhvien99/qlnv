import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Department from '../models/department';

export async function newDepartment(req: Request, res: Response) {
	const department = new Department(req.body);
	const saved = await department.save();
	res.json(saved);
}
export async function getDepartmentList(req: Request, res: Response) {
	let { limit, skip, sortBy, orderBy, keyword } = req.query;
	let query: any = {};
	let sort: any = { createAt: -1 };
	if (keyword) {
		const regex = new RegExp(escapeRegex(keyword as string), 'gi');
		query.departmentName = regex;
	}
	if (sortBy) {
		sort = {};
		sort[sortBy.toString()] = parseInt(orderBy as string);
	}
	if (!skip) skip = '0';
	if (!limit) limit = '20';

	let data: any = await Department.aggregate([
		{
			$lookup: {
				from: 'employees',
				localField: 'leader',
				foreignField: '_id',
				as: 'leader',
			},
		},
		{ $match: query },
		{
			$facet: {
				list: [
					{ $sort: sort },
					{ $skip: parseInt(skip as string) },
					{ $limit: parseInt(limit as string) },
					{ $project: { 'leader.password': 0 } },
				],
				totalCount: [{ $count: 'count' }],
			},
		},
	]);

	data = { list: data[0].list, count: data[0].totalCount[0]?.count };
	res.json(data);
}
export async function getDepartment(req: Request, res: Response) {
	const { id } = req.params;
	let data = await Department.aggregate([
		{ $match: { _id: new mongoose.Types.ObjectId(id) } },
		{
			$lookup: {
				from: 'employees',
				localField: 'leader',
				foreignField: '_id',
				as: 'leader',
			},
		},
		{ $project: { 'leader.password': 0 } },
		{
			$lookup: {
				from: 'employees',
				localField: '_id',
				foreignField: 'department',
				as: 'members',
			},
		},
		{ $project: { 'members.password': 0 } },
	]);
	res.json(data);
}
export async function updateDepartment(req: Request, res: Response) {
	let data = req.body;
	Department.findOneAndUpdate({ _id: req.params.id }, data).then((result) => res.json(result));
}
export async function deleteDepartment(req: Request, res: Response) {
	const { id } = req.params;
	Department.deleteOne({ _id: id }).then((result) => res.json(result));
}

function escapeRegex(text: string) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
