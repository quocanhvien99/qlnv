import { ArrowLeftOutlined, UploadOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Button, Col, DatePicker, Form, Input, message, Row, Select, Upload } from 'antd';
import { RcFile } from 'antd/lib/upload';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../config/store';
import style from '../style.module.scss';
import './style.scss';
import { RootState } from '../../../config/store';
import { getEntities } from '../../Department/reducer';
import { clearState, createEntity } from '../reducer';
import { useForm } from 'antd/lib/form/Form';
import { useNavigate } from 'react-router-dom';

function Add() {
	const navigate = useNavigate();

	const [imgSrc, setImgSrc] = useState<string | null>();
	const [avatar, setAvatar] = useState<File>();

	const departmentList = useSelector((state: RootState) => state.department.entities);
	const updating = useSelector((state: RootState) => state.employee.updating);
	const updateSuccess = useSelector((state: RootState) => state.employee.updateSuccess);
	const errorMessage = useSelector((state: RootState) => state.employee.errorMessage);

	const dispatch = useDispatch<AppDispatch>();

	const [form] = useForm();

	const previewHandle = async (file: RcFile) => {
		const src: string = await new Promise((resolve) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result as string);
		});
		setImgSrc(src);
		setAvatar(file);
		return false;
	};
	const onFinish = (values: any) => {
		const formData: any = new FormData();
		for (const key in values) {
			formData.append(key, values[key]);
		}
		formData.append('avatar', avatar);
		dispatch(createEntity({ entity: formData, cb: () => form.resetFields() }));

		return false;
	};

	useEffect(() => {
		if (departmentList.length === 0) {
			dispatch(getEntities({}));
		}

		return () => {
			dispatch(clearState());
		};
	}, [departmentList, dispatch]);
	useEffect(() => {
		if (!updating && updateSuccess) {
			message.success('Th??m th??nh vi??n m???i th??nh c??ng!');
		}
		if (!updating && !updateSuccess && errorMessage) {
			message.error('???? c?? l???i x???y ra, th??m th??nh vi??n m???i kh??ng th??nh c??ng!');
		}
		return () => {
			dispatch(clearState());
		};
	}, [dispatch, updating, updateSuccess, errorMessage]);

	return (
		<div className={style.Card}>
			<div className={style.goBack} style={{ marginBottom: '32px' }} onClick={() => navigate(-1)}>
				<ArrowLeftOutlined /> Quay l???i
			</div>
			<Form
				form={form}
				labelCol={{ span: 6 }}
				labelWrap={true}
				labelAlign="left"
				onFinish={onFinish}
				initialValues={{ role: 'employee' }}>
				<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
					<Col xs={24} lg={18}>
						<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
							<Col xs={24} lg={12}>
								<Form.Item name={'full_name'} label="H??? t??n">
									<Input />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'date_of_birth'} label="Ng??y sinh">
									<DatePicker style={{ width: '100%' }} />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'countryside'} label="?????a ch???">
									<Input />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'first_day_work'} label="Ng??y ?????u l??m">
									<DatePicker style={{ width: '100%' }} />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'department'} label="B??? ph???n">
									<Select>
										{departmentList.map((x) => (
											<Select.Option value={x._id} key={x._id}>
												{x.departmentName}
											</Select.Option>
										))}
									</Select>
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'phone_number'} label="S??T">
									<Input type="tel" pattern="[0-9]{10}" />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'email'} label="Email">
									<Input type="email" />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'password'} label="M???t kh???u">
									<Input.Password />
								</Form.Item>
							</Col>
							<Col xs={24} lg={12}>
								<Form.Item name={'role'} label="Ph??n lo???i">
									<Select>
										<Select.Option value={'employee'}>Nh??n vi??n</Select.Option>
										<Select.Option value={'admin'}>Admin</Select.Option>
									</Select>
								</Form.Item>
							</Col>
						</Row>
					</Col>
					<Col xs={24} lg={6} className="upload-avatar">
						<Avatar size={150} shape="square" icon={<UserOutlined />} src={imgSrc}></Avatar>

						<Upload beforeUpload={previewHandle} listType="picture" maxCount={1} accept=".jpg,.png">
							<Button style={{ width: '150px' }} icon={<UploadOutlined />}>
								???nh ?????i di???n
							</Button>
						</Upload>
					</Col>
				</Row>
				<Button type="primary" htmlType="submit" loading={updating}>
					X??c nh???n
				</Button>
			</Form>
		</div>
	);
}

export default Add;
