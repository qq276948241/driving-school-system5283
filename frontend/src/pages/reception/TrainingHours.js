import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, InputNumber, DatePicker, Input, message, Space } from 'antd';
import { trainingApi, authApi } from '../../services';
import { SUBJECTS } from '../../utils/constants';
import dayjs from 'dayjs';

const TrainingHours = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await trainingApi.list();
      setRecords(res.data);
    } catch (err) {
      message.error('获取学时记录失败');
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

  const fetchCoaches = async () => {
    try {
      const res = await authApi.listCoaches();
      setCoaches(res.data);
    } catch (err) {
      message.error('获取教练列表失败');
    }
  };

  useEffect(() => {
    fetchData();
    fetchStudents();
    fetchCoaches();
  }, []);

  const handleSubmit = async (values) => {
    try {
      await trainingApi.record({
        student_id: values.student_id,
        coach_id: values.coach_id,
        subject: values.subject,
        hours: values.hours,
        training_date: values.training_date.format('YYYY-MM-DD'),
        remark: values.remark,
      });
      message.success('登记成功');
      setAddModal(false);
      form.resetFields();
      fetchData();
    } catch (err) {
      message.error(err.response?.data?.error || '登记失败');
    }
  };

  const columns = [
    { title: '培训日期', dataIndex: 'training_date', key: 'training_date' },
    { title: '学员', key: 'student', render: (_, r) => r.student?.user?.name },
    { title: '教练', key: 'coach', render: (_, r) => r.coach?.user?.name },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    { title: '学时', dataIndex: 'hours', key: 'hours', render: (v) => `${v} 小时` },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  return (
    <div className="page-container">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setAddModal(true)}>登记学时</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="登记学时"
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="student_id" label="选择学员" rules={[{ required: true, message: '请选择学员' }]}>
            <Select
              showSearch
              placeholder="请选择学员"
              optionFilterProp="label"
              options={students.map(s => ({ value: s.id, label: `${s.user?.name}（${s.id_card}）` }))}
            />
          </Form.Item>

          <Form.Item name="coach_id" label="选择教练" rules={[{ required: true, message: '请选择教练' }]}>
            <Select
              showSearch
              placeholder="请选择教练"
              optionFilterProp="label"
              options={coaches.map(c => ({ value: c.id, label: `${c.user?.name}（${c.coach_no}）` }))}
            />
          </Form.Item>

          <Form.Item name="subject" label="科目" rules={[{ required: true, message: '请选择科目' }]}>
            <Select placeholder="请选择科目" options={SUBJECTS} />
          </Form.Item>

          <Form.Item name="hours" label="学时（小时）" rules={[{ required: true, message: '请输入学时' }]}>
            <InputNumber min={0.5} max={8} step={0.5} style={{ width: '100%' }} placeholder="请输入学时" />
          </Form.Item>

          <Form.Item name="training_date" label="培训日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="可选" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认登记</Button>
              <Button onClick={() => { setAddModal(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TrainingHours;
