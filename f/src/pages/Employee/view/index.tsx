import { ArrowLeftOutlined } from '@ant-design/icons';
import { Avatar, Col, Row } from 'antd';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppDispatch, RootState } from '../../../config/store';
import { getEntity } from '../reducer';
import style from '../style.module.scss';

function View() {
	const { id } = useParams();
	const navigate = useNavigate();

	const dispatch = useDispatch<AppDispatch>();
	const entity = useSelector((state: RootState) => state.employee.entity);
	const loading = useSelector((state: RootState) => state.employee.loading);

	useEffect(() => {
		if (id) dispatch(getEntity(id));
	}, [id, dispatch]);

	return (
		<div className={style.Card}>
			<div className={style.goBack} style={{ marginBottom: '32px' }} onClick={() => navigate(-1)}>
				<ArrowLeftOutlined /> Quay lại
			</div>
			<div>
				<Row justify="center" style={{ marginBottom: 30 }}>
					<Avatar src={entity?.avatar} size={150}></Avatar>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Họ tên
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{entity?.full_name}</Col>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Ngày sinh
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{dateParse(entity?.date_of_birth as Date)}</Col>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Ngày vào làm
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{dateParse(entity?.first_day_work as Date)}</Col>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Bộ phận
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{entity?.department[0]?.departmentName}</Col>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Quê quán
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{entity?.countryside}</Col>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Số điện thoại
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{entity?.phone_number}</Col>
				</Row>
				<Row>
					<Col span={11} style={{ textAlign: 'right' }}>
						Email
					</Col>
					<Col span={2} style={{ textAlign: 'center' }}>
						:
					</Col>
					<Col span={11}>{entity?.email}</Col>
				</Row>
			</div>
		</div>
	);
}

export default View;

function dateParse(date: Date) {
	return moment(date).format('YYYY-MM-DD');
}
