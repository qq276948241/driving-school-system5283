import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services';

const Login = ({ onLogin }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const res = await authApi.login(values);
      onLogin(res.data.token, res.data.user);
      message.success('登录成功');
      const role = res.data.user.role;
      switch (role) {
        case 'student': navigate('/student/courses'); break;
        case 'coach': navigate('/coach/schedule'); break;
        case 'reception': navigate('/reception/students'); break;
        case 'admin': navigate('/boss/dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      message.error(err.response?.data?.error || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-title">驾校管理系统</div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <span>还没有账号？</span>
            <Link to="/register"> 学员注册</Link>
          </div>
          <div style={{ textAlign: 'center', marginTop: 12, color: '#999', fontSize: 12 }}>
            测试账号：admin/admin123（管理员）
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
