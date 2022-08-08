import { Table } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../config/store';
import { getEntities } from './reducer';
import style from './style.module.scss';

function Checkin() {
	const dispatch = useDispatch<AppDispatch>();
	const uid = useSelector((state: RootState) => state.authentication.account._id);
	const list = useSelector((state: RootState) => state.checkin.entities);
	const loading = useSelector((state: RootState) => state.checkin.loading);

	useEffect(() => {
		dispatch(getEntities());
	}, [dispatch, uid]);

	return (
		<div className={style.Card}>
			<Table
				columns={[
					{
						title: 'Ngày',
						dataIndex: 'at',
						key: 'date',
						render: (value) => <span>{moment(value).format('YYYY-MM-DD')}</span>,
					},
					{
						title: 'Lúc',
						dataIndex: 'at',
						key: 'at',
						render: (value) => <span>{moment(value).format('hh:mm')}</span>,
					},
					{ title: 'Muộn', dataIndex: 'late', key: 'late', render: (value) => <span>{value + ' phút'}</span> },
					{
						title: 'Roll',
						dataIndex: 'roll',
						key: 'roll',
						render: (value) => <span style={{ color: colorCode(value) }}>{value}</span>,
					},
				]}
				dataSource={list}
				loading={loading}
				pagination={false}
			/>
		</div>
	);
}

export default Checkin;

function colorCode(roll: Number) {
	if (roll === 0) return '#c92020';
	else if (roll >= 1) return '#3cc932';
	else return '#c7c932';
}
