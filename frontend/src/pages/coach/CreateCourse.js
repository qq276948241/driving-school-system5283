import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Card, Select, DatePicker, TimePicker, message, Space } from 'antd';
import { courseApi, authApi } from '../../services';
import { SUBJECTS } from '../../utils/constants';
import dayjs from 'dayjs';

const CreateCourse = () => {
  const [form] = Form.useForm();
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchCoaches = async () => {
    try {
      const res = await authApi.listCoaches();
      setCoaches(res.data);
      if (user.role === 'coach') {
        const myCoach = res.data.find(c => c.user_id === user.id);
        if (myCoach) {
          form.setFieldsValue({ coach_id: myCoach.id });
        }
      }
    } catch (err) {
      message.error('获取教练列表失败');
    }
  };

  useEffect(() => {
    fetchCoaches();
  }, []);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await courseApi.create({
        coach_id: values.coach_id,
        course_date: values.course_date.format('YYYY-MM-DD'),
        start_time: values.time_range[0].format('HH:mm'),
        end_time: values.time_range[1].format('HH:mm'),
        subject: values.subject,
      });
      message.success('课程发布成功');
      form.resetFields();
    } catch (err) {
      message.error(err.response?.data?.error || '发布失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <Card title="发布课程" style={{ maxWidth: 600, margin: '0 auto' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          {user.role !== 'coach' && (
            <Form.Item
              name="coach_id"
              label="选择教练"
              rules={[{ required: true, message: '请选择教练' }]}
            >
              <Select
                placeholder="请选择教练"
                options={coaches.map(c => ({ value: c.id, label: `${c.user?.name}（${c.coach_no}）` }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="course_date"
            label="上课日期"
            rules={[{ required: true, message: '请选择日期' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="选择日期" disabledDate={(d) => d && d.isBefore(dayjs().startOf('day'))} />
          </Form.Item>

          <Form.Item
            name="time_range"
            label="上课时段"
            rules={[{ required: true, message: '请选择时段' }]}
          >
            <TimePicker.RangePicker style={{ width: '100%' }} format="HH:mm" minuteStep={30} />
          </Form.Item>

          <Form.Item
            name="subject"
            label="教学科目"
            rules={[{ required: true, message: '请选择科目' }]}
          >
            <Select placeholder="请选择科目" options={SUBJECTS} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>发布课程</Button>
              <Button onClick={() => form.resetFields()}>重置</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;
