import React from 'react';
import { Layout as AntLayout, Menu, Avatar, Dropdown, Space } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  CalendarOutlined,
  BookOutlined,
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  FileTextOutlined,
  BarChartOutlined,
  UserAddOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { ROLE_NAMES, ROLES } from '../utils/constants';

const { Header, Sider, Content } = AntLayout;

const Layout = ({ user, children, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    switch (user.role) {
      case ROLES.STUDENT:
        return [
          { key: '/student/courses', icon: <CalendarOutlined />, label: '预约课程' },
          { key: '/student/my-courses', icon: <BookOutlined />, label: '我的课程' },
          { key: '/student/progress', icon: <BarChartOutlined />, label: '学习进度' },
        ];
      case ROLES.COACH:
        return [
          { key: '/coach/schedule', icon: <CalendarOutlined />, label: '我的排班' },
          { key: '/coach/students', icon: <TeamOutlined />, label: '我的学员' },
          { key: '/coach/create-course', icon: <FileTextOutlined />, label: '发布课程' },
        ];
      case ROLES.RECEPTION:
        return [
          { key: '/reception/students', icon: <TeamOutlined />, label: '学员管理' },
          { key: '/reception/training-hours', icon: <BookOutlined />, label: '学时登记' },
          { key: '/reception/exams', icon: <FileTextOutlined />, label: '考试安排' },
          { key: '/reception/finances', icon: <DollarOutlined />, label: '财务对账' },
        ];
      case ROLES.ADMIN:
        return [
          { key: '/boss/dashboard', icon: <DashboardOutlined />, label: '数据概览' },
          { key: '/boss/coach-stats', icon: <BarChartOutlined />, label: '教练统计' },
          { key: '/boss/subject-stats', icon: <BarChartOutlined />, label: '科目通过率' },
          { key: '/boss/users', icon: <UserAddOutlined />, label: '用户管理' },
        ];
      default:
        return [];
    }
  };

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: onLogout,
    },
  ];

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" breakpoint="lg" collapsedWidth="0">
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          驾校管理系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={getMenuItems()}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} />
              <span>{user.name}（{ROLE_NAMES[user.role]}）</span>
            </Space>
          </Dropdown>
        </Header>
        <Content style={{ margin: 0, padding: 24, minHeight: 280 }}>
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};

export default Layout;
