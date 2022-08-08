import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export default (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.token as string;
	if (!token) return res.status(401).json({ msg: 'Cần đăng nhập' });

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, user) => {
		if (err?.message == 'jwt expired') {
			return res.status(403).json({ msg: 'Token expired', code: 1 });
		}
		if (err) return res.status(403).json({ msg: 'Invalid token', code: 2 });
		res.locals.user = user;
		next();
	});
};
