import {
	DownOutlined,
	LeftOutlined,
	MenuFoldOutlined,
	MenuUnfoldOutlined,
	RightOutlined,
	UpOutlined,
	UserOutlined,
} from '@ant-design/icons';
import { Avatar, Dropdown, Layout, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import menuItems from '../../config/menu';
import { logout } from '../reducers/authentication';
import { AppDispatch, RootState } from '../../config/store';
import style from './style.module.scss';

const { Header, Sider, Content } = Layout;
const role_color = {
	admin: 'rgb(255,0,0)',
	employee: 'rgb(0,0,255)',
};

function LayoutCustom() {
	const [collapsed, setCollapsed] = useState(false);
	const [collapsedWidth, setCollapsedWidth] = useState(80);
	const [siderWidth, setSiderWidth] = useState<string | number>(200);
	const [dropDownAccount, setDropDownAccount] = useState(false);
	const account = useSelector((state: RootState) => state.authentication.account);
	const isAuthenticated = useSelector((state: RootState) => state.authentication.isAuthenticated);
	const dispatch = useDispatch<AppDispatch>();
	const nav = useNavigate();

	useEffect(() => {
		if (!isAuthenticated) nav('/login');
	}, [isAuthenticated, nav]);

	return (
		<Layout>
			<Sider
				className={`${style.sider} ${collapsedWidth === 0 ? style.absolute : ''}`}
				width={siderWidth}
				collapsible
				collapsed={collapsed}
				collapsedWidth={collapsedWidth}
				onCollapse={(value) => setCollapsed(value)}
				breakpoint="sm"
				onBreakpoint={(broken) => {
					setCollapsedWidth(broken ? 0 : 80);
					setSiderWidth(broken ? '100vw' : 200);
				}}
				trigger={null}>
				<Link to="/">
					<div className={style.logo_container}>
						<div className={style.logo}></div>
					</div>
				</Link>
				<Menu mode="inline" theme="dark" items={menuItems[account.role === 'admin' ? 'admin' : 'employee']} />
				<div
					className={`${style.triggerCollapse} ${collapsed && collapsedWidth === 0 ? style.zero_width : ''}`}
					onClick={() => setCollapsed(!collapsed)}>
					{collapsed ? <RightOutlined /> : <LeftOutlined />}
				</div>
			</Sider>
			<Layout className={style.main_layout}>
				<Header className={style.header}>
					{collapsedWidth === 0 && (
						<div onClick={() => setCollapsed(!collapsed)}>
							{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						</div>
					)}
					<Dropdown
						trigger={['click']}
						placement="bottomRight"
						arrow={collapsedWidth !== 0}
						onVisibleChange={(visible) => setDropDownAccount(visible)}
						overlay={
							<Menu
								items={[
									{ key: 0, label: <Link to="/Account">Tài khoản</Link> },
									{ key: 1, label: <Link to="/">Đổi mật khẩu</Link> },
									{ key: 2, label: <div onClick={() => dispatch(logout())}>Đăng xuất</div> },
								]}
								className={collapsedWidth === 0 ? style.menu_full_width : ''}
							/>
						}>
						<div className={style.account}>
							<Avatar size={'large'} src={account.avatar} icon={<UserOutlined />} />
							<div className={style.info}>
								<p>{account.email}</p>
								<p style={{ color: role_color[account.role as 'admin' | 'employee'] }}>{account.role}</p>
							</div>
							<div className={style.dropDownBtn}>
								{dropDownAccount ? (
									<UpOutlined style={{ color: '#777' }} />
								) : (
									<DownOutlined style={{ color: '#777' }} />
								)}
							</div>
						</div>
					</Dropdown>
				</Header>
				<Content>
					<Outlet />
				</Content>
			</Layout>
		</Layout>
	);
}

export default LayoutCustom;
