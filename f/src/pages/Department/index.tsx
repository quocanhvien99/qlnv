import {
	DeleteOutlined,
	EditOutlined,
	ExclamationCircleOutlined,
	EyeOutlined,
	PlusCircleOutlined,
	SearchOutlined,
} from '@ant-design/icons';
import { Button, Form, Input, message, Modal, Select, Space, Table, TablePaginationConfig } from 'antd';
import { ColumnsType, FilterValue, SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../config/store';
import { clearState, createEntity, deleteEntity, getEntities, updateEntity } from './reducer';
import { getEntities as getEntitiesEmployee } from '../Employee/reducer';
import style from './style.module.scss';
import { useForm } from 'antd/lib/form/Form';

function Department() {
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
	});

	//For create new department
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isCreate, setIsCreate] = useState(false);
	const [initValue, setinitValue] = useState<any>();
	const employeeList = useSelector((state: RootState) => state.employee.entities);
	const [form] = useForm();

	const [sorter, setSorter] = useState<any>({ sortBy: undefined, orderBy: undefined });
	const [keyword, setKeyword] = useState('');
	const departmentList = useSelector((state: RootState) => state.department.entities);
	const loading = useSelector((state: RootState) => state.department.loading);
	const deleteSuccess = useSelector((state: RootState) => state.department.deleteSuccess);
	const updateSuccess = useSelector((state: RootState) => state.department.updateSuccess);
	const updating = useSelector((state: RootState) => state.department.updating);
	const errorMessage = useSelector((state: RootState) => state.department.errorMessage);
	const total = useSelector((state: RootState) => state.department.totalItems);
	const role = useSelector((state: RootState) => state.authentication.account.role);

	const dispatch = useDispatch<AppDispatch>();

	const onTableChange = (
		pagination: TablePaginationConfig,
		filters: Record<string, FilterValue | null>,
		sorter: SorterResult<any> | SorterResult<any>[]
	) => {
		setPagination({ ...pagination, current: pagination.current });
		sorter = sorter as SorterResult<any>;
		if (sorter.field)
			setSorter({
				sortBy: sorter.field,
				orderBy: sorter.order === 'ascend' ? 1 : -1,
			});
	};

	useEffect(() => {
		const limit = pagination.pageSize;
		const skip = (pagination.current! - 1) * pagination.pageSize!;
		dispatch(getEntities({ limit, skip, keyword, ...sorter }));
	}, [pagination, dispatch, sorter, keyword]);

	useEffect(() => {
		if (deleteSuccess && !updating) {
			message.success('Xoá bộ phận hoàn tất.');
		}
		if (updateSuccess && !updating) {
			message.success('Thêm bộ phận thành công.');
		}
		if ((!deleteSuccess || !updateSuccess) && !updating && errorMessage) {
			message.error('Đã có lỗi xảy ra!');
		}
		dispatch(clearState());
	}, [dispatch, deleteSuccess, updateSuccess, updating, errorMessage]);

	const columns: ColumnsType<any> = [
		{
			title: 'Bộ phận',
			dataIndex: 'departmentName',
			key: 'departmentName',
			sorter: true,
		},
		{
			title: 'Trưởng nhóm',
			dataIndex: 'leader',
			key: 'leader',
			sorter: true,
			render: (value) => (value[0] ? <Link to={'/employee/' + value[0]._id}>{value[0].full_name}</Link> : ''),
		},
		{
			title: 'Ngày tạo',
			dataIndex: 'createAt',
			key: 'createAt',
			sorter: true,
			render: (value) => moment(value).format('YYYY-MM-DD'),
		},
		{
			title: '',
			dataIndex: 'action',
			render: (_, record) => (
				<Space>
					<Link to={`/department/${record._id}`}>
						<Button size="small" type="primary" icon={<EyeOutlined />}>
							Xem
						</Button>
					</Link>
					{role === 'admin' && (
						<>
							<Button
								className={style['success-btn']}
								size="small"
								type="primary"
								icon={<EditOutlined />}
								onClick={() => {
									setIsCreate(false);
									setIsModalVisible(true);
									setinitValue({ _id: record._id, departmentName: record.departmentName });
								}}>
								Sửa
							</Button>
							<Button
								size="small"
								type="primary"
								danger
								icon={<DeleteOutlined />}
								onClick={() => {
									Modal.confirm({
										title: 'Bạn có chắc chắn muốn xoá bộ phận này?',
										icon: <ExclamationCircleOutlined />,
										onOk() {
											return new Promise(async (resolve, reject) => {
												const limit = pagination.pageSize;
												const skip = (pagination.current! - 1) * pagination.pageSize!;
												await dispatch(deleteEntity({ id: record._id, params: { limit, skip, keyword, ...sorter } }));
												resolve(null);
											}).catch(() => console.log('Oops errors!'));
										},
										onCancel() {},
									});
								}}>
								Xoá
							</Button>
						</>
					)}
				</Space>
			),
		},
	];

	return (
		<>
			<div className={style.Card}>
				<div>
					Hiển thị{' '}
					<Select value={pagination.pageSize} onChange={(value) => setPagination({ ...pagination, pageSize: value })}>
						<Select.Option value={10}>10</Select.Option>
						<Select.Option value={20}>20</Select.Option>
						<Select.Option value={30}>30</Select.Option>
						<Select.Option value={50}>50</Select.Option>
					</Select>
				</div>
				<div className={style.table_top}>
					<Form onFinish={(values) => setKeyword(values.keyword)}>
						<Form.Item name={'keyword'} style={{ maxWidth: 200, margin: 0 }}>
							<Input
								suffix={
									<button className={style.btn_submit} type="submit">
										<SearchOutlined />
									</button>
								}
							/>
						</Form.Item>
					</Form>
					{role === 'admin' && (
						<Button
							type="primary"
							icon={<PlusCircleOutlined />}
							onClick={() => {
								setIsModalVisible(true);
								setIsCreate(true);
							}}>
							Thêm mới
						</Button>
					)}
				</div>

				<div className={style.table_container}>
					<Table
						columns={columns}
						dataSource={departmentList}
						pagination={{ ...pagination, total }}
						onChange={onTableChange}
						loading={loading}
						className={style.table}
					/>
				</div>
			</div>
			<Modal
				title={isCreate ? 'Thêm bộ phận' : 'Sửa'}
				visible={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				onOk={async () => {
					const limit = pagination.pageSize;
					const skip = (pagination.current! - 1) * pagination.pageSize!;
					if (isCreate) {
						await dispatch(
							createEntity({ entity: form.getFieldsValue(), cb: () => {}, params: { limit, skip, keyword, ...sorter } })
						);
					} else {
						const newData = form.getFieldsValue();
						if (!newData.leader) delete newData.leader;
						await dispatch(
							updateEntity({
								id: initValue._id,
								entity: newData,
								cb: () => {},
								params: { limit, skip, keyword, ...sorter },
							})
						);
					}
					form.resetFields();
					setIsModalVisible(false);
				}}
				confirmLoading={updating}>
				<Form form={form} initialValues={initValue}>
					<Form.Item label="Tên bộ phận" name="departmentName">
						<Input></Input>
					</Form.Item>
					<Form.Item label="Trưởng nhóm" name="leader">
						<Select
							showSearch
							defaultActiveFirstOption={false}
							showArrow={false}
							filterOption={false}
							onSearch={(() => {
								let timeoutId: any = null;
								return (newValue) => {
									clearTimeout(timeoutId);
									timeoutId = setTimeout(() => dispatch(getEntitiesEmployee({ keyword: newValue })), 1000);
								};
							})()}
							notFoundContent={null}>
							{employeeList.map((x) => (
								<Select.Option value={x._id}>{x.full_name}</Select.Option>
							))}
						</Select>
					</Form.Item>
				</Form>
			</Modal>
		</>
	);
}

export default Department;
