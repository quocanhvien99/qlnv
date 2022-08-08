import { ApartmentOutlined, AuditOutlined, CalendarOutlined, DashboardOutlined, UserOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const menuItems = {
	admin: [
		{
			label: <Link to={'/employee'}>Nhân viên</Link>,
			key: 1,
			icon: <UserOutlined />,
		},
		{
			label: <Link to={'/department'}>Phòng ban</Link>,
			key: 2,
			icon: <ApartmentOutlined />,
		},
	],
	employee: [
		{
			label: <Link to={'/checkin'}>Chấm công</Link>,
			key: 1,
			icon: <CalendarOutlined />,
		},
		{
			label: <Link to={'/paidleave'}>Nghỉ phép</Link>,
			key: 2,
			icon: <AuditOutlined />,
		},
		{ label: <Link to={'/ot'}>OT</Link>, key: 3, icon: <DashboardOutlined /> },
		{ label: <Link to={'/department'}>Phòng ban</Link>, key: 4, icon: <ApartmentOutlined /> }, //techlead khac employee
	],
};

export default menuItems;
