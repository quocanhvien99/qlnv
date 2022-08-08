import mongoose from 'mongoose';

const otSchema = new mongoose.Schema({
	employee: mongoose.Types.ObjectId,
	to: Date,
	department: mongoose.Types.ObjectId,
	describe: String,
	state: { type: String, default: 'pending' }, //pending approve reject
	createAt: { type: Date, default: Date.now() },
});

export default mongoose.model('ot', otSchema);
