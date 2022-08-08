import { MailOutlined } from '@ant-design/icons';
import { Button, Checkbox, Col, Form, Input, Row } from 'antd';
import Title from 'antd/lib/typography/Title';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { IOptions, RecursivePartial } from 'tsparticles-engine';
import { clearErrorMsg, login } from '../../shared/reducers/authentication';
import { AppDispatch, RootState } from '../../config/store';
import style from './style.module.scss';

const particlesOptions: RecursivePartial<IOptions> = {
	background: {
		color: {
			value: '#a10d92',
		},
	},
	fpsLimit: 120,
	interactivity: {
		events: {
			onHover: {
				enable: true,
				mode: 'grab',
			},
			resize: true,
		},
		modes: {
			push: {
				quantity: 4,
			},
			repulse: {
				distance: 200,
				duration: 0.4,
			},
		},
	},
	particles: {
		color: {
			value: '#ffffff',
		},
		links: {
			color: '#ffffff',
			distance: 150,
			enable: true,
			opacity: 1,
			width: 1,
		},
		collisions: {
			enable: true,
		},
		move: {
			direction: 'none',
			enable: true,
			outModes: {
				default: 'bounce',
			},
			random: false,
			speed: 3,
			straight: false,
		},
		number: {
			density: {
				enable: true,
				area: 700,
			},
			value: 60,
		},
		opacity: {
			value: 0.5,
		},
		shape: {
			type: 'circle',
		},
		size: {
			value: { min: 1, max: 5 },
		},
	},
	detectRetina: true,
};

function Login() {
	const isAuthenticated = useSelector((state: RootState) => state.authentication.isAuthenticated);
	const errorMessage = useSelector((state: RootState) => state.authentication.errorMessage);

	const dispatch = useDispatch<AppDispatch>();

	const [form] = Form.useForm();

	const particlesInit = async (main: any) => {
		// you can initialize the tsParticles instance (main) here, adding custom shapes or presets
		// this loads the tsparticles package bundle, it's the easiest method for getting everything ready
		// starting from v2 you can add only the features you need reducing the bundle size
		await loadFull(main);
	};

	const onFinish = (values: { email: string; password: string; remember: boolean }) => {
		dispatch(login(values));
		if (values.remember) localStorage.setItem('remember', JSON.stringify(values));
		else localStorage.removeItem('remember');

		form.setFieldsValue({ password: '' });
	};

	useEffect(() => {
		let remember: any = localStorage.getItem('remember');
		form.setFieldsValue(JSON.parse(remember));
	}, [form]);

	return !isAuthenticated ? (
		<>
			<Particles id="tsparticles" init={particlesInit} options={particlesOptions} />
			<Row justify="center" className={style.row}>
				<Col xs={24} sm={16} md={12} lg={8} xl={6} className={style.col}>
					<Title level={3} className={`${style.title} ${style.white_text}`}>
						Đăng Nhập
					</Title>
					<Form form={form} onFinish={onFinish}>
						<Form.Item name={'email'} rules={[{ required: true, message: 'Cần nhập thông tin email.' }]}>
							<Input suffix={<MailOutlined />} className={style.input} />
						</Form.Item>
						<Form.Item
							name={'password'}
							rules={[{ required: true, message: 'Cần nhập mật khẩu.' }]}
							validateStatus={errorMessage && 'error'}
							help={errorMessage}>
							<Input.Password className={style.input} onInput={(e) => dispatch(clearErrorMsg())} />
						</Form.Item>
						<Form.Item name="remember" valuePropName="checked">
							<Checkbox className={style.white_text}>Ghi nhớ</Checkbox>
						</Form.Item>
						<Form.Item>
							<Button type="primary" htmlType="submit">
								Đăng nhập
							</Button>
						</Form.Item>
					</Form>
				</Col>
			</Row>
		</>
	) : (
		<Navigate to={'/'} />
	);
}

export default Login;
