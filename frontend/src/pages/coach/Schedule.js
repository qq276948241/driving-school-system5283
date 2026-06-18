import React, { useEffect, useState } from 'react';
import { Table, Tag, DatePicker, Space, Button, message } from 'antd';
import { courseApi } from '../../services';
import { SUBJECTS, COURSE_STATUS } from '../../utils/constants';
import dayjs from 'dayjs';

const Schedule = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (user.role === 'coach') {
        const coach = JSON.parse(localStorage.getItem('coach') || '{}');
        if (coach.id) params.coach_id = coach.id;
      }
      if (dateFilter) params.date = dateFilter;
      const res = await courseApi.list(params);
      setCourses(res.data);
    } catch (err) {
      message.error('获取排班失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleComplete = async (id) => {
    try {
      await courseApi.complete(id);
      message.success('已标记完成');
      fetchCourses();
    } catch (err) {
      message.error('操作失败');
    }
  };

  const getStatusColor = (status) => {
    const colors = { available: 'green', booked: 'blue', completed: 'gray' };
    return colors[status] || 'default';
  };

  const columns = [
    { title: '日期', dataIndex: 'course_date', key: 'course_date', sorter: (a, b) => a.course_date.localeCompare(b.course_date) },
    { title: '时段', key: 'time', render: (_, r) => `${r.start_time} - ${r.end_time}` },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    { title: '学员', key: 'student', render: (_, r) => r.student?.user?.name || '（未预约）' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (v) => <Tag color={getStatusColor(v)}>{COURSE_STATUS[v] || v}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => record.status === 'booked' ? (
        <Button size="small" type="primary" onClick={() => handleComplete(record.id)}>
          标记完成
        </Button>
      ) : null,
    },
  ];

  return (
    <div className="page-container">
      <Space style={{ marginBottom: 16 }}>
        <DatePicker
          placeholder="选择日期"
          allowClear
          onChange={(d) => setDateFilter(d ? d.format('YYYY-MM-DD') : null)}
        />
        <Button type="primary" onClick={fetchCourses}>筛选</Button>
        <Button onClick={() => { setDateFilter(null); fetchCourses(); }}>重置</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default Schedule;
