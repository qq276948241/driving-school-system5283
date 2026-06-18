import React, { useEffect, useState } from 'react';
import { Table, Button, Select, DatePicker, Space, Tag, Modal, message } from 'antd';
import { courseApi, authApi } from '../../services';
import { SUBJECTS, COURSE_STATUS } from '../../utils/constants';
import dayjs from 'dayjs';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ coach_id: null, date: null, subject: null });
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = { status: 'available' };
      if (filters.coach_id) params.coach_id = filters.coach_id;
      if (filters.date) params.date = filters.date;
      if (filters.subject) params.subject = filters.subject;
      const res = await courseApi.list(params);
      setCourses(res.data);
    } catch (err) {
      message.error('获取课程列表失败');
    } finally {
      setLoading(false);
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
    fetchCourses();
    fetchCoaches();
  }, []);

  const handleFilter = () => {
    fetchCourses();
  };

  const handleBook = (record) => {
    setSelectedCourse(record);
    setBookingModal(true);
  };

  const confirmBooking = async () => {
    try {
      await courseApi.book({ course_id: selectedCourse.id });
      message.success('预约成功');
      setBookingModal(false);
      setSelectedCourse(null);
      fetchCourses();
    } catch (err) {
      message.error(err.response?.data?.error || '预约失败');
    }
  };

  const columns = [
    { title: '日期', dataIndex: 'course_date', key: 'course_date' },
    { title: '时段', key: 'time', render: (_, r) => `${r.start_time} - ${r.end_time}` },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    { title: '教练', key: 'coach', render: (_, r) => r.coach?.user?.name || '-' },
    { title: '车牌号', key: 'car_no', render: (_, r) => r.coach?.car_no || '-' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v) => <Tag color="green">{COURSE_STATUS[v]}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleBook(record)}>
          预约
        </Button>
      ),
    },
  ];

  return (
    <div className="page-container">
      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder="选择教练"
          style={{ width: 180 }}
          allowClear
          options={coaches.map(c => ({ value: c.id, label: `${c.user?.name}（${c.coach_no}）` }))}
          onChange={(v) => setFilters({ ...filters, coach_id: v })}
        />
        <DatePicker
          placeholder="选择日期"
          allowClear
          onChange={(d) => setFilters({ ...filters, date: d ? d.format('YYYY-MM-DD') : null })}
        />
        <Select
          placeholder="选择科目"
          style={{ width: 150 }}
          allowClear
          options={SUBJECTS}
          onChange={(v) => setFilters({ ...filters, subject: v })}
        />
        <Button type="primary" onClick={handleFilter}>筛选</Button>
        <Button onClick={() => { setFilters({ coach_id: null, date: null, subject: null }); fetchCourses(); }}>重置</Button>
      </Space>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="确认预约"
        open={bookingModal}
        onOk={confirmBooking}
        onCancel={() => { setBookingModal(false); setSelectedCourse(null); }}
        okText="确认预约"
        cancelText="取消"
      >
        {selectedCourse && (
          <div>
            <p>日期：{selectedCourse.course_date}</p>
            <p>时段：{selectedCourse.start_time} - {selectedCourse.end_time}</p>
            <p>科目：{SUBJECTS.find(s => s.value === selectedCourse.subject)?.label}</p>
            <p>教练：{selectedCourse.coach?.user?.name}</p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Courses;
