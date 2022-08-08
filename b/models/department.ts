import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
	departmentName: String,
	leader: mongoose.Types.ObjectId,
	createAt: {
		type: Date,
		default: Date.now(),
	},
});

export default mongoose.model('department', departmentSchema);
