import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, message, Space, Tag } from 'antd';
import { authApi } from '../../services';
import { ROLE_NAMES } from '../../utils/constants';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();
  const [roleFilter, setRoleFilter] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const res = await authApi.listUsers(roleFilter);
      setUsers(res.data);
    } catch (err) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleCreate = async (values) => {
    try {
      await authApi.createUser(values);
      message.success('创建成功');
      setAddModal(false);
      form.resetFields();
      fetchUsers();
    } catch (err) {
      message.error(err.response?.data?.error || '创建失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await authApi.deleteUser(id);
      message.success('删除成功');
      fetchUsers();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'purple',
      reception: 'cyan',
      coach: 'orange',
      student: 'blue',
    };
    return colors[role] || 'default';
  };

  const columns = [
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '姓名', dataIndex: 'name', key: 'name' },
    { title: '手机号', dataIndex: 'phone', key: 'phone', render: (v) => v || '-' },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (v) => <Tag color={getRoleColor(v)}>{ROLE_NAMES[v] || v}</Tag>,
    },
    { title: '创建时间', key: 'created', render: (_, r) => r.created_at?.split('T')[0] },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => record.username !== 'admin' ? (
        <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
      ) : <span style={{ color: '#999' }}>系统账号</span>,
    },
  ];

  return (
    <div className="page-container">
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder="筛选角色"
          style={{ width: 150 }}
          allowClear
          options={[
            { value: 'admin', label: '管理员' },
            { value: 'reception', label: '前台' },
            { value: 'coach', label: '教练' },
            { value: 'student', label: '学员' },
          ]}
          onChange={setRoleFilter}
        />
        <Button type="primary" onClick={() => setAddModal(true)}>新增用户</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新增用户"
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>

          <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Form.Item name="name" label="姓名" rules={[{ required: true, message: '请输入姓名' }]}>
            <Input placeholder="请输入真实姓名" />
          </Form.Item>

          <Form.Item name="phone" label="手机号">
            <Input placeholder="请输入手机号" />
          </Form.Item>

          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色" options={[
              { value: 'admin', label: '管理员' },
              { value: 'reception', label: '前台' },
              { value: 'coach', label: '教练' },
            ]} />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.role !== cur.role}>
            {({ getFieldValue }) =>
              getFieldValue('role') === 'coach' ? (
                <>
                  <Form.Item name="coach_no" label="教练编号" rules={[{ required: true, message: '请输入教练编号' }]}>
                    <Input placeholder="如：JL001" />
                  </Form.Item>
                  <Form.Item name="car_no" label="车牌号">
                    <Input placeholder="如：粤B12345" />
                  </Form.Item>
                  <Form.Item name="specialty" label="专长">
                    <Input placeholder="如：C1/C2手动自动" />
                  </Form.Item>
                </>
              ) : null
            }
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认创建</Button>
              <Button onClick={() => { setAddModal(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;
