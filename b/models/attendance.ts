import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
	at: { type: Date, default: Date.now() },
	employee: mongoose.Types.ObjectId,
	late: Number, //tính theo phút
	roll: Number,
});

export default mongoose.model('attendance', attendanceSchema);
