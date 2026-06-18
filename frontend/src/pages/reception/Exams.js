import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, DatePicker, TimePicker, Input, Tag, InputNumber, message, Space } from 'antd';
import { examApi, authApi } from '../../services';
import { SUBJECTS, EXAM_STATUS } from '../../utils/constants';
import dayjs from 'dayjs';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [resultModal, setResultModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [form] = Form.useForm();
  const [resultForm] = Form.useForm();

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await examApi.list();
      setExams(res.data);
    } catch (err) {
      message.error('获取考试列表失败');
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
    fetchExams();
    fetchStudents();
  }, []);

  const handleCreate = async (values) => {
    try {
      await examApi.create({
        student_id: values.student_id,
        subject: values.subject,
        exam_date: values.exam_date.format('YYYY-MM-DD'),
        exam_time: values.exam_time.format('HH:mm'),
        location: values.location,
      });
      message.success('考试安排成功');
      setAddModal(false);
      form.resetFields();
      fetchExams();
    } catch (err) {
      message.error(err.response?.data?.error || '安排失败');
    }
  };

  const handleUpdateResult = async (values) => {
    try {
      await examApi.updateResult(selectedExam.id, values);
      message.success('成绩更新成功');
      setResultModal(false);
      resultForm.resetFields();
      setSelectedExam(null);
      fetchExams();
    } catch (err) {
      message.error('更新失败');
    }
  };

  const handleDelete = async (id) => {
    try {
      await examApi.delete(id);
      message.success('删除成功');
      fetchExams();
    } catch (err) {
      message.error('删除失败');
    }
  };

  const columns = [
    { title: '学员', key: 'student', render: (_, r) => r.student?.user?.name },
    { title: '考试日期', dataIndex: 'exam_date', key: 'exam_date' },
    { title: '时间', dataIndex: 'exam_time', key: 'exam_time' },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    { title: '地点', dataIndex: 'location', key: 'location' },
    {
      title: '结果',
      key: 'result',
      render: (_, r) => {
        if (r.status === 'completed') {
          return <Tag color={r.result === 'pass' ? 'green' : 'red'}>
            {r.result === 'pass' ? '通过' : '未通过'}（{r.score}分）
          </Tag>;
        }
        return <Tag color="blue">{EXAM_STATUS[r.status] || r.status}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          {record.status === 'scheduled' && (
            <Button size="small" onClick={() => { setSelectedExam(record); resultForm.resetFields(); setResultModal(true); }}>
              录入成绩
            </Button>
          )}
          <Button size="small" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Space style={{ marginBottom: 16 }}>
        <Button type="primary" onClick={() => setAddModal(true)}>安排考试</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={exams}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="安排考试"
        open={addModal}
        onCancel={() => { setAddModal(false); form.resetFields(); }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="student_id" label="选择学员" rules={[{ required: true, message: '请选择学员' }]}>
            <Select
              showSearch
              placeholder="请选择学员"
              optionFilterProp="label"
              options={students.map(s => ({ value: s.id, label: `${s.user?.name}（${s.id_card}）` }))}
            />
          </Form.Item>

          <Form.Item name="subject" label="考试科目" rules={[{ required: true, message: '请选择科目' }]}>
            <Select placeholder="请选择科目" options={SUBJECTS} />
          </Form.Item>

          <Form.Item name="exam_date" label="考试日期" rules={[{ required: true, message: '请选择日期' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item name="exam_time" label="考试时间" rules={[{ required: true, message: '请选择时间' }]}>
            <TimePicker style={{ width: '100%' }} format="HH:mm" />
          </Form.Item>

          <Form.Item name="location" label="考试地点">
            <Input placeholder="请输入考试地点" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认安排</Button>
              <Button onClick={() => { setAddModal(false); form.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="录入考试成绩"
        open={resultModal}
        onCancel={() => { setResultModal(false); setSelectedExam(null); resultForm.resetFields(); }}
        footer={null}
      >
        {selectedExam && (
          <div style={{ marginBottom: 16 }}>
            <p>学员：{selectedExam.student?.user?.name}</p>
            <p>科目：{SUBJECTS.find(s => s.value === selectedExam.subject)?.label}</p>
          </div>
        )}
        <Form form={resultForm} layout="vertical" onFinish={handleUpdateResult}>
          <Form.Item name="result" label="考试结果" rules={[{ required: true, message: '请选择结果' }]}>
            <Select placeholder="请选择结果" options={[
              { value: 'pass', label: '通过' },
              { value: 'fail', label: '未通过' },
            ]} />
          </Form.Item>

          <Form.Item name="score" label="分数">
            <InputNumber min={0} max={100} style={{ width: '100%' }} placeholder="请输入分数" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">确认提交</Button>
              <Button onClick={() => { setResultModal(false); setSelectedExam(null); resultForm.resetFields(); }}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Exams;
