import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, Modal, message } from 'antd';
import { courseApi } from '../../services';
import { SUBJECTS, COURSE_STATUS } from '../../utils/constants';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await courseApi.list({});
      let myCourses = res.data;
      if (user.role === 'student') {
        const student = JSON.parse(localStorage.getItem('student') || '{}');
        myCourses = res.data.filter(c => c.student_id !== null);
      }
      setCourses(myCourses);
    } catch (err) {
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCancel = (record) => {
    setSelectedCourse(record);
    setCancelModal(true);
  };

  const confirmCancel = async () => {
    try {
      await courseApi.cancel(selectedCourse.id);
      message.success('取消成功');
      setCancelModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      message.error(err.response?.data?.error || '取消失败');
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
    { title: '教练', key: 'coach', render: (_, r) => r.coach?.user?.name || '-' },
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
        <Button danger size="small" onClick={() => handleCancel(record)}>取消预约</Button>
      ) : null,
    },
  ];

  return (
    <div className="page-container">
      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="确认取消"
        open={cancelModal}
        onOk={confirmCancel}
        onCancel={() => { setCancelModal(false); setSelectedCourse(null); }}
        okText="确认取消"
        cancelText="返回"
        okButtonProps={{ danger: true }}
      >
        <p>确定要取消这个课程预约吗？</p>
      </Modal>
    </div>
  );
};

export default MyCourses;
