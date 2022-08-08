import { Router } from 'express';
import * as departmentController from '../controllers/department';

const router = Router();

router.get('/', departmentController.getDepartmentList);
router.get('/:id', departmentController.getDepartment);
router.delete('/:id', departmentController.deleteDepartment);
router.post('/', departmentController.newDepartment);
router.put('/:id', departmentController.updateDepartment);

export default router;
