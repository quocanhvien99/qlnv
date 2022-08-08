import { ArrowLeftOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Col, Divider, Row, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../config/store';
import { getEntity } from '../reducer';
import style from '../style.module.scss';

const columns: ColumnsType<any> = [
	{
		title: 'Ảnh đại diện',
		dataIndex: 'avatar',
		render: (value) => <Avatar shape="square" size={64} src={value} icon={<UserOutlined />} />,
	},
	{
		title: 'Họ tên',
		dataIndex: 'full_name',
		key: 'full_name',
	},
	{
		title: 'Ngày vào làm',
		dataIndex: 'first_day_work',

		render: (value) => moment(value).format('YYYY-MM-DD'),
	},
	{
		title: 'Số điện thoại',
		dataIndex: 'phone_number',
	},
	{
		title: 'Email',
		dataIndex: 'email',
	},
];

function View() {
	const { id } = useParams();
	const navigate = useNavigate();

	const dispatch = useDispatch<AppDispatch>();

	const department = useSelector((state: RootState) => state.department.entity);

	useEffect(() => {
		if (id) dispatch(getEntity(id));
	}, [id, dispatch]);

	return (
		<div className={style.Card}>
			<div className={style.goBack} style={{ marginBottom: '32px' }} onClick={() => navigate(-1)}>
				<ArrowLeftOutlined /> Quay lại
			</div>
			<Divider orientation="left">Thông tin chung</Divider>
			<p>
				<b>Tên nhóm: </b> {department?.departmentName}
			</p>
			<p>
				<b>Trưởng bộ phận:</b>
			</p>
			<Row>
				<Col style={{ marginRight: '10px' }}>
					<Avatar src={department?.leader[0].avatar} shape="square" size={100}></Avatar>
				</Col>
				<Col>
					<p>{department?.leader[0].full_name}</p>
					<p>{department?.leader[0].email}</p>
					<p>{department?.leader[0].phone_number}</p>
				</Col>
			</Row>
			<Divider orientation="left">Danh sách thành viên</Divider>
			<div className={style.table_container}>
				<Table columns={columns} dataSource={department?.members} pagination={false} className={style.table}></Table>
			</div>
		</div>
	);
}

export default View;
