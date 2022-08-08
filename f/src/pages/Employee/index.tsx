import {
	DeleteOutlined,
	ExclamationCircleOutlined,
	EyeOutlined,
	PlusCircleOutlined,
	PlusOutlined,
	SearchOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Form, Input, message, Modal, Select, Space } from 'antd';
import Table, { ColumnsType, TablePaginationConfig } from 'antd/lib/table';
import { FilterValue, SorterResult } from 'antd/lib/table/interface';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { AppDispatch, RootState } from '../../config/store';
import { deleteEntity, getEntities, clearState } from './reducer';
import style from './style.module.scss';

function Eployee() {
	const [pagination, setPagination] = useState<TablePaginationConfig>({
		current: 1,
		pageSize: 10,
	});
	const [sorter, setSorter] = useState<any>({ sortBy: undefined, orderBy: undefined });
	const [keyword, setKeyword] = useState('');
	const employeeList = useSelector((state: RootState) => state.employee.entities);
	const loading = useSelector((state: RootState) => state.employee.loading);
	const deleteSuccess = useSelector((state: RootState) => state.employee.deleteSuccess);
	const updating = useSelector((state: RootState) => state.employee.updating);
	const errorMessage = useSelector((state: RootState) => state.employee.errorMessage);
	const total = useSelector((state: RootState) => state.employee.totalItems);

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
		return () => {
			dispatch(clearState());
		};
	}, [pagination, dispatch, sorter, keyword]);

	useEffect(() => {
		if (deleteSuccess && !updating) {
			message.success('Xoá thành viên hoàn tất.');
		}
		if (!deleteSuccess && !updating && errorMessage) {
			message.error('Đã có lỗi xảy ra!');
		}
	}, [deleteSuccess, updating, errorMessage]);

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
			sorter: true,
		},
		{
			title: 'Ngày vào làm',
			dataIndex: 'first_day_work',
			sorter: true,
			render: (value) => moment(value).format('YYYY-MM-DD'),
		},
		{
			title: 'Số điện thoại',
			dataIndex: 'phone_number',
			sorter: true,
		},
		{
			title: 'Email',
			dataIndex: 'email',
			sorter: true,
		},
		{
			title: 'Bộ phận',
			dataIndex: 'department',
			sorter: true,
			render: (value) => (value[0] ? <Link to={'/department/' + value[0]._id}>{value[0].departmentName}</Link> : ''),
		},
		{
			title: '',
			dataIndex: 'action',
			render: (_, record) => (
				<Space>
					<Link to={`/employee/${record._id}`}>
						<Button size="small" type="primary" icon={<EyeOutlined />}>
							Xem
						</Button>
					</Link>
					<Button
						size="small"
						type="primary"
						danger
						icon={<DeleteOutlined />}
						onClick={() => {
							Modal.confirm({
								title: 'Bạn có chắc chắn muốn xoá nhân viên này?',
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
				</Space>
			),
		},
	];

	return (
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
				<Link to={'./add'}>
					<Button type="primary" icon={<PlusCircleOutlined />}>
						Thêm mới
					</Button>
				</Link>
			</div>

			<div className={style.table_container}>
				<Table
					columns={columns}
					dataSource={employeeList}
					pagination={{ ...pagination, total }}
					onChange={onTableChange}
					loading={loading}
					className={style.table}
				/>
			</div>
		</div>
	);
}

export default Eployee;
