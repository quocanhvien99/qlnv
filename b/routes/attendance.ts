import { Router } from 'express';
import multer from 'multer';
import * as attendanceController from '../controllers/attendance';
import * as otController from '../controllers/ot';
import * as paidleaveController from '../controllers/paidleave';
import storage from '../shared/storage';
const upload = multer({ storage });

const router = Router();

router.post('/', attendanceController.checkin);
router.get('/', attendanceController.getAttendanceList);

router.post('/ot', upload.array('files', 5), otController.create);
router.get('/ot', otController.getList);
router.get('/ot/approve/:id', otController.approve);
router.get('/ot/reject/:id', otController.reject);

router.post('/paidleave', upload.array('files', 5), paidleaveController.create);
router.get('/paidleave', paidleaveController.getList);
router.get('/paidleave/approve/:id', paidleaveController.approve);
router.get('/paidleave/reject/:id', paidleaveController.reject);

export default router;
