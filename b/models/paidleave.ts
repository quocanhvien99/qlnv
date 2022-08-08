import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
	url: String,
	name: String,
});

const paidleaveSchema = new mongoose.Schema({
	employee: mongoose.Types.ObjectId,
	date: Date,
	department: mongoose.Types.ObjectId,
	describe: String,
	files: [fileSchema],
	state: { type: String, default: 'pending' }, //pending approve reject
	createAt: { type: Date, default: Date.now() },
});

export default mongoose.model('paidleave', paidleaveSchema);
