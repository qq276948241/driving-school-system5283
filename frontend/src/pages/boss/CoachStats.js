import React, { useEffect, useState } from 'react';
import { Table, Progress, Tag, message } from 'antd';
import { statsApi } from '../../services';

const CoachStats = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await statsApi.getCoachStats();
      setStats(res.data);
    } catch (err) {
      message.error('获取教练统计失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { title: '教练姓名', dataIndex: 'coach_name', key: 'coach_name' },
    { title: '教练编号', dataIndex: 'coach_no', key: 'coach_no' },
    { title: '车牌号', dataIndex: 'car_no', key: 'car_no', render: (v) => v || '-' },
    { title: '带教学员数', dataIndex: 'student_count', key: 'student_count', sorter: (a, b) => a.student_count - b.student_count },
    { title: '课程总数', dataIndex: 'course_count', key: 'course_count', sorter: (a, b) => a.course_count - b.course_count },
    { title: '累计学时', dataIndex: 'total_hours', key: 'total_hours', render: (v) => `${v} 小时`, sorter: (a, b) => a.total_hours - b.total_hours },
    {
      title: '学员通过率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      sorter: (a, b) => a.pass_rate - b.pass_rate,
      render: (v) => (
        <Progress
          percent={Math.round(v)}
          size="small"
          status={v >= 70 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  return (
    <div className="page-container">
      <Table
        columns={columns}
        dataSource={stats}
        rowKey="coach_id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default CoachStats;
