import { CheckOutlined, CloseOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Col, Collapse, DatePicker, Form, Input, message, Modal, Row, Space, Table } from 'antd';
import { useForm } from 'antd/lib/form/Form';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../config/store';
import { approveEntity, clearState, createEntity, getEntities, getLeaderEntities, rejectEntity } from './reducer';
import Style from './style.module.scss';

const { Panel } = Collapse;
const { Item } = Form;

function PaidLeave() {
	const dispatch = useDispatch<AppDispatch>();
	const entities = useSelector((state: RootState) => state.ot.entities);
	const leaderEntities = useSelector((state: RootState) => state.ot.leaderEntities);
	const loading = useSelector((state: RootState) => state.ot.loading);
	const updating = useSelector((state: RootState) => state.ot.updating);
	const updateSuccess = useSelector((state: RootState) => state.ot.updateSuccess);
	const errorMessage = useSelector((state: RootState) => state.ot.errorMessage);
	const isLeader = useSelector((state: RootState) => state.authentication.account.leader);
	const uid = useSelector((state: RootState) => state.authentication.account._id);

	const [form] = useForm();

	const onFinish = (values: any) => {
		const formData: any = new FormData();
		for (const key in values) {
			formData.append(key, values[key]);
		}
		dispatch(createEntity({ entity: formData, cb: () => form.resetFields() }));

		return false;
	};

	useEffect(() => {
		dispatch(getEntities());
	}, [dispatch]);

	useEffect(() => {
		if (!updating && updateSuccess) {
			message.success('Thành công.');
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
				<Panel header="Khai báo làm thêm giờ" key={1}>
					<Form requiredMark={false} form={form} onFinish={onFinish}>
						<Row gutter={{ xs: 8, sm: 16, md: 24, lg: 32 }}>
							<Col xs={24} lg={12}>
								<Item label="Làm thêm đến" name="to" rules={[{ required: true, message: 'Chọn mốc thời gian nghỉ!' }]}>
									<DatePicker showTime style={{ width: '100%' }} />
								</Item>
							</Col>
							<Col xs={24} lg={12}>
								<Item
									label="Chi tiết"
									name="describe"
									rules={[{ required: true, message: 'Xin hãy nêu những việc đã làm!' }]}>
									<Input.TextArea rows={1} />
								</Item>
							</Col>
						</Row>
						<Button htmlType="submit" type="primary">
							Gửi
						</Button>
					</Form>
				</Panel>
				<Panel header="Lịch sử" key={2}>
					<Table
						columns={[
							{
								title: 'Ngày',
								dataIndex: 'to',
								key: 'date',
								//@ts-ignore
								sorter: (a, b) => a.to > b.to,
								render: (value) => <span>{moment(value).format('YYYY-MM-DD')}</span>,
							},
							{
								title: 'Thời gian',
								dataIndex: 'to',
								key: 'time',
								render: (value) => <span>{moment(value).format('hh:mm')}</span>,
							},
							{
								title: 'Chi tiết',
								dataIndex: 'describe',
								key: 'describe',
							},
							{
								title: 'Trạng thái',
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
					<Panel header="Danh sách làm thêm giờ của nhân viên" key={3}>
						<Table
							columns={[
								{
									title: 'Ngày',
									dataIndex: 'to',
									key: 'to',
									render: (value) => <span>{moment(value).format('YYYY-MM-DD')}</span>,
								},
								{
									title: 'Thời gian',
									dataIndex: 'to',
									key: 'time',
									render: (value) => <span>{moment(value).format('hh:mm')}</span>,
								},
								{
									title: 'Lý do',
									dataIndex: 'describe',
									key: 'describe',
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
														title: 'Bạn có chắc chắn muốn thực hiện hành động này?',
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
														title: 'Bạn có chắc chắn muốn thực hiện hành động này?',
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
