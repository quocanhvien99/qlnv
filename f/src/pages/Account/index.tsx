import { UploadOutlined } from '@ant-design/icons';
import { Button, DatePicker, Descriptions, Form, Input, Modal, Upload } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { RcFile } from 'antd/lib/upload';
import moment from 'moment';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../config/store';
import { updateEntity } from '../../shared/reducers/authentication';

import style from './style.module.scss';

const { Item } = Descriptions;

function Account() {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [avatar, setAvatar] = useState<File | null>(null);

	const dispatch = useDispatch<AppDispatch>();
	const user = useSelector((state: RootState) => state.authentication.account);

	const [form] = useForm();

	const previewHandle = async (file: RcFile) => {
		setAvatar(file);
		return false;
	};
	const onFinish = (values: any) => {
		const formData: any = new FormData();
		for (const key in values) {
			formData.append(key, values[key]);
		}
		if (avatar) formData.append('avatar', avatar);

		dispatch(updateEntity({ entity: formData, id: user._id }));

		setIsModalVisible(false);
	};

	return (
		<>
			<div className={style.Card}>
				<Descriptions
					bordered
					title="Thông tin"
					extra={
						<Button type="primary" onClick={() => setIsModalVisible(true)}>
							Sửa
						</Button>
					}>
					<Item label="Họ tên" span={3}>
						{user.full_name}
					</Item>
					<Item label="Ngày sinh">{moment(user.date_of_birth).format('YYYY-MM-DD')}</Item>
					<Item label="Email">{user.email}</Item>
					<Item label="SĐT">{user.phone_number}</Item>
					<Item label="Quê quán">{user.countryside}</Item>
					<Item label="Chức vụ">
						<span style={{ textTransform: 'capitalize' }}>{user.role}</span>
					</Item>
					<Item label="Bộ phận">
						<Link to={'/department/' + user.department._id}>{user.department.departmentName}</Link>
					</Item>
				</Descriptions>
			</div>
			<Modal
				title="Sửa thông tin"
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				onOk={() => onFinish(form.getFieldsValue())}>
				<Form form={form}>
					<Form.Item label="Họ tên" name="full_name" initialValue={user.full_name}>
						<Input></Input>
					</Form.Item>
					<Form.Item label="Ngày sinh" name="date_of_birth" initialValue={moment(user.date_of_birth)}>
						<DatePicker style={{ width: '100%' }} />
					</Form.Item>
					<Form.Item label="SĐT" name="phone_number" initialValue={user.phone_number}>
						<Input type="tel" pattern="[0-9]{10}" />
					</Form.Item>
					<Form.Item label="Quê quán" name="countryside" initialValue={user.countryside}>
						<Input></Input>
					</Form.Item>
					<Form.Item>
						<Upload beforeUpload={previewHandle} listType="picture" maxCount={1} accept=".jpg,.png">
							<Button style={{ width: '150px' }} icon={<UploadOutlined />}>
								Ảnh đại diện
							</Button>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}

export default Account;
