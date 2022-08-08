import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
	full_name: String,
	email: String,
	date_of_birth: Date,
	first_day_work: Date,
	phone_number: String,
	avatar: String,
	countryside: String,
	password: String,
	department: mongoose.Types.ObjectId,
	role: String, //admin employee
});

export default mongoose.model('employee', employeeSchema);
