import {
	CheckOutlined,
	CloseOutlined,
	ExclamationCircleOutlined,
	LinkOutlined,
	UploadOutlined,
} from '@ant-design/icons';
import {
	Button,
	Col,
	Collapse,
	DatePicker,
	Dropdown,
	Form,
	Input,
	Menu,
	message,
	Modal,
	Row,
	Space,
	Table,
	Upload,
} from 'antd';
import { useForm } from 'antd/lib/form/Form';
import { RcFile } from 'antd/lib/upload';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../config/store';
import { approveEntity, clearState, createEntity, getEntities, getLeaderEntities, rejectEntity } from './reducer';
import Style from './style.module.scss';

const { Panel } = Collapse;
const { Item } = Form;

function PaidLeave() {
	const [files, setFiles] = useState<RcFile[]>([]);

	const dispatch = useDispatch<AppDispatch>();
	const entities = useSelector((state: RootState) => state.paidleave.entities);
	const leaderEntities = useSelector((state: RootState) => state.paidleave.leaderEntities);
	const loading = useSelector((state: RootState) => state.paidleave.loading);
	const updating = useSelector((state: RootState) => state.paidleave.updating);
	const updateSuccess = useSelector((state: RootState) => state.paidleave.updateSuccess);
	const errorMessage = useSelector((state: RootState) => state.paidleave.errorMessage);
	const isLeader = useSelector((state: RootState) => state.authentication.account.leader);
	const uid = useSelector((state: RootState) => state.authentication.account._id);

	const [form] = useForm();

	const previewHandle = async (_: any, fileList: RcFile[]) => {
		setFiles(fileList);
		return false;
	};
	const onRemove = (file: any) => {
		setFiles(files.filter((x) => !(file.uid === x.uid)));

		return true;
	};
	const onFinish = (values: any) => {
		const formData: any = new FormData();
		for (const key in values) {
			formData.append(key, values[key]);
		}
		files?.forEach((x) => {
			formData.append('files', x);
		});
		dispatch(createEntity({ entity: formData, cb: () => form.resetFields(), isLeader: false }));

		return false;
	};

	useEffect(() => {
		dispatch(getEntities());
	}, [dispatch]);

	useEffect(() => {
		if (!updating && updateSuccess) {
			message.success('Th??nh c??ng.');
		}
		if (!updating && !updateSuccess && errorMessage) {
			message.error(errorMessage);
		}
		dispatch(clearState());
	}, [updating, updateSuccess, errorMessage, dispatch]);

	useEffect(() => {
		if (isLeader) dispatch(getLeaderEntities());
	}, [dispatch, isLeader]);

	return (
		<div className={Style.Card}>
			<Collapse defaultActiveKey={1}>
				<Panel header="Xin ngh??? ph??p" key={1}>
					<Form requiredMark={false} form={form} onFinish={onFinish}>
						<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
							<Col xs={24} lg={12}>
								<Item label="Ng??y" name="date" rules={[{ required: true, message: 'Xin ch???n ng??y ngh??? ph??p!' }]}>
									<DatePicker style={{ width: '100%' }} />
								</Item>
							</Col>
							<Col xs={24} lg={12}>
								<Item
									label="L?? do"
									name="describe"
									rules={[{ required: true, message: 'Xin h??y n??u l?? do xin ngh???!' }]}>
									<Input.TextArea rows={1} />
								</Item>
							</Col>
						</Row>
						<Item>
							<Upload
								onRemove={onRemove}
								beforeUpload={previewHandle}
								multiple
								maxCount={5}
								accept=".jpg,.png,.pdf,.docx">
								<Button style={{ width: '150px' }} icon={<UploadOutlined />}>
									T???p ????nh k??m
								</Button>
							</Upload>
						</Item>
						<Button htmlType="submit" type="primary">
							G???i
						</Button>
					</Form>
				</Panel>
				<Panel header="L???ch s???" key={2}>
					<Table
						columns={[
							{
								title: 'Ng??y',
								dataIndex: 'date',
								key: 'date',
								//@ts-ignore
								sorter: (a, b) => a.date > b.date,
								render: (value) => <span>{moment(value).format('YYYY-MM-DD')}</span>,
							},
							{
								title: 'L?? do',
								dataIndex: 'describe',
								key: 'describe',
							},
							{
								title: 'Tr???ng th??i',
								dataIndex: 'state',
								key: 'state',
								render: (value) => (
									<span style={{ color: colorCode(value), textTransform: 'capitalize' }}>{value}</span>
								),
							},
						]}
						dataSource={entities}
						pagination={{ pageSize: 5 }}
						loading={loading}
					/>
				</Panel>
				{isLeader && (
					<Panel header="????n xin ngh??? c???a nh??n vi??n" key={3}>
						<Table
							columns={[
								{
									title: 'Ng??y',
									dataIndex: 'date',
									key: 'date',
									render: (value) => <span>{moment(value).format('YYYY-MM-DD')}</span>,
								},
								{
									title: 'L?? do',
									dataIndex: 'describe',
									key: 'describe',
								},
								{
									title: 'T???p ????nh k??m',
									dataIndex: 'files',
									key: 'files',
									render: (files) => (
										<Dropdown
											overlay={
												<Menu
													items={files.map((file: any, i: number) => ({
														key: i,
														label: (
															<a href={file.url} target="_blank" rel="noreferrer">
																{file.name}
															</a>
														),
													}))}
												/>
											}>
											<Button icon={<LinkOutlined />}>{files.lenght} files...</Button>
										</Dropdown>
									),
								},
								{
									dataIndex: 'actions',
									key: 'actions',
									render: (_, record) => (
										<Space>
											<Button
												size="small"
												type="primary"
												icon={<CheckOutlined />}
												onClick={() => {
													Modal.confirm({
														title: 'B???n c?? ch???c ch???n mu???n th???c hi???n h??nh ?????ng n??y?',
														icon: <ExclamationCircleOutlined />,
														onOk() {
															return new Promise(async (resolve, reject) => {
																await dispatch(approveEntity(record._id));
																if (uid === record.employee) await dispatch(getEntities());
																resolve(null);
															}).catch(() => console.log('Oops errors!'));
														},
														onCancel() {},
													});
												}}></Button>
											<Button
												size="small"
												type="primary"
												icon={<CloseOutlined />}
												danger
												onClick={() => {
													Modal.confirm({
														title: 'B???n c?? ch???c ch???n mu???n th???c hi???n h??nh ?????ng n??y?',
														icon: <ExclamationCircleOutlined />,
														onOk() {
															return new Promise(async (resolve, reject) => {
																await dispatch(rejectEntity(record._id));
																if (uid === record.employee) await dispatch(getEntities());
																resolve(null);
															}).catch(() => console.log('Oops errors!'));
														},
														onCancel() {},
													});
												}}></Button>
										</Space>
									),
								},
							]}
							dataSource={leaderEntities.filter((x) => x.state === 'pending')}
						/>
					</Panel>
				)}
			</Collapse>
		</div>
	);
}

export default PaidLeave;

function colorCode(state: String) {
	switch (state) {
		case 'approve':
			return '#3cc932';
		case 'pending':
			return '#c7c932';
		case 'reject':
			return '#c92020';
	}
}
