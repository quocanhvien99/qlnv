import React from 'react';
import './App.css';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Layout from './shared/layout';
import Employee from './pages/Employee';
import EmployeeAdd from './pages/Employee/add';
import EmployeeView from './pages/Employee/view';
import Department from './pages/Department';
import DepartmentView from './pages/Department/view';
import Checkin from './pages/Checkin';
import PaidLeave from './pages/PaidLeave';
import Ot from './pages/Ot';
import Account from './pages/Account';
import { useSelector } from 'react-redux';
import { RootState } from './config/store';

function App() {
	const role = useSelector((state: RootState) => state.authentication.account.role);
	return (
		<div className="App">
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Layout />}>
						<Route path="/" element={<Navigate to={role === 'admin' ? '/employee' : '/checkin'} />}></Route>
						<Route path="/employee" element={<Employee />}></Route>
						<Route path="/employee/add" element={<EmployeeAdd />} />
						<Route path="/employee/:id" element={<EmployeeView />} />
						<Route path="/department" element={<Department />}></Route>
						<Route path="/department/:id" element={<DepartmentView />} />
						<Route path="/checkin" element={<Checkin />}></Route>
						<Route path="/paidleave" element={<PaidLeave />}></Route>
						<Route path="/ot" element={<Ot />}></Route>
						<Route path="/account" element={<Account />}></Route>
					</Route>

					<Route path="/login" element={<Login />} />
				</Routes>
			</BrowserRouter>
		</div>
	);
}

export default App;
