import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, Input, InputNumber, DatePicker, Tag, Statistic, Row, Col, Card, message, Space } from 'antd';
import { financeApi, authApi } from '../../services';
import dayjs from 'dayjs';

const Finances = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [summary, setSummary] = useState({ total_income: 0, total_expense: 0, net_profit: 0 });
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();
  const [filters, setFilters] = useState({ start_date: null, end_date: null, type: null });

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.start_date) params.start_date = filters.start_date;
      if (filters.end_date) params.end_date = filters.end_date;
      if (filters.type) params.type = filters.type;
      const res = await financeApi.list(params);
      setRecords(res.data.records);
      setSummary({
        total_income: res.data.total_income,
        total_expense: res.data.total_expense,
        net_profit: res.data.net_profit,
      });
    } catch (err) {
      message.error('获取财务记录失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await authApi.listStudents();
      setStudents(res.data);
    } catch (err) {
      message.error('获取学员列表失败');
    }
  };

  useEffect(() => {
    fetchRecords();
    fetchStudents();
  }, []);

  const handleCreate = async (values) => {
    try {
      await financeApi.create({
        student_id: values.student_id,
        type: values.type,
        amount: values.amount,
        payment_method: values.payment_method,
        remark: values.remark,
      });
      message.success('记录成功');
      setAddModal(false);
      form.resetFields();
      fetchRecords();
    } catch (err) {
      message.error(err.response?.data?.error || '记录失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await financeApi.delete(id);
      message.success('删除成功');
      fetchRecords();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '日期', key: 'date', render: (_, r) => r.created_at?.split('T')[0] },
    { title: '学员', key: 'student', render: (_, r) => r.student?.user?.name },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (v) => <Tag color={v === 'income' ? 'green' : 'red'}>{v === 'income' ? '收款' : '支出'}</Tag>,
    },
    {
      title: '金额',
      dataIndex: 'amount',
      key: 'amount',
      render: (v, r) => <span style={{ color: r.type === 'income' ? '#52c41a' : '#ff4d4f', fontWeight: 'bold' }}>
        {r.type === 'income' ? '+' : '-'}¥{v.toFixed(2)}
      </span>,
    },
    { title: '支付方式', dataIndex: 'payment_method', key: 'payment_method', render: (v) => v || '-' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="总收入" value={summary.total_income} precision={2} prefix="¥" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="总支出" value={summary.total_expense} precision={2} prefix="¥" valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic title="净利润" value={summary.net_profit} precision={2} prefix="¥" valueStyle={{ color: summary.net_profit >= 0 ? '#1890ff' : '#ff4d4f' }} />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }} wrap>
        <DatePicker
          placeholder="开始日期"
          allowClear
          onChange={(d) => setFilters({ ...filters, start_date: d ? d.format('YYYY-MM-DD') : null })}
        />
        <DatePicker
          placeholder="结束日期"
          allowClear
          onChange={(d) => setFilters({ ...filters, end_date: d ? d.format('YYYY-MM-DD') : null })}
        />
        <Select
          placeholder="类型"
          style={{ width: 120 }}
          allowClear
          options={[
            { value: 'income', label: '收款' },
            { value: 'expense', label: '支出' },
          ]}
          onChange={(v) => setFilters({ ...filters, type: v })}
        />
        <Button type="primary" onClick={fetchRecords}>筛选</Button>
        <Button onClick={() => { setFilters({ start_date: null, end_date: null, type: null }); fetchRecords(); }}>重置</Button>
        <Button type="primary" onClick={() => setAddModal(true)}>新增记录</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="新增财务记录"
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="student_id" label="关联学员" rules={[{ required: true, message: '请选择学员' }]}>
            <Select
              showSearch
              placeholder="请选择学员"
              optionFilterProp="label"
              options={students.map(s => ({ value: s.id, label: `${s.user?.name}（${s.id_card}）` }))}
            />
          </Form.Item>

          <Form.Item name="type" label="类型" rules={[{ required: true, message: '请选择类型' }]}>
            <Select placeholder="请选择类型" options={[
              { value: 'income', label: '收款' },
              { value: 'expense', label: '支出' },
            ]} />
          </Form.Item>

          <Form.Item name="amount" label="金额（元）" rules={[{ required: true, message: '请输入金额' }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder="请输入金额" />
          </Form.Item>

          <Form.Item name="payment_method" label="支付方式">
            <Select placeholder="请选择支付方式" allowClear options={[
              { value: 'cash', label: '现金' },
              { value: 'wechat', label: '微信' },
              { value: 'alipay', label: '支付宝' },
              { value: 'bank', label: '银行卡' },
            ]} />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="可选，如：报名费、补考费等" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认提交</Button>
              <Button onClick={() => { setAddModal(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Finances;
