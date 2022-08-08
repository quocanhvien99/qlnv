import { Router } from 'express';
import * as userController from '../controllers/employee';
import protectedRoute from '../Middleware/protectedRoute';

const router = Router();

router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/logout', userController.logout);
router.get('/token', userController.getToken);

router.get('/account', protectedRoute, userController.info);

export default router;
