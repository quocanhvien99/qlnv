import { Router } from 'express';
import multer from 'multer';
import * as employeeController from '../controllers/employee';
import storage from '../shared/storage';
const upload = multer({ storage });

const router = Router();

router.get('/', employeeController.getEmployeeList);
router.get('/:id', employeeController.getEmployee);
router.delete('/:id', employeeController.deleteEmployee);
router.post('/', upload.single('avatar'), employeeController.newEmployee);
router.put('/:id', upload.single('avatar'), employeeController.updateEmployee);

export default router;
