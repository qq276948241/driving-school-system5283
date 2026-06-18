import React, { useEffect, useState } from 'react';
import { Card, Progress as AntProgress, Table, Tag, Row, Col, Statistic, message } from 'antd';
import { BookOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { trainingApi, examApi } from '../../services';
import { SUBJECTS, EXAM_STATUS } from '../../utils/constants';

const StudentProgress = () => {
  const [profile, setProfile] = useState(null);
  const [trainings, setTrainings] = useState([]);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await trainingApi.getProgress();
      setProfile(res.data.student);
      setTrainings(res.data.trainings || []);
      const examRes = await examApi.list({});
      setExams(examRes.data.filter(e => e.student_id === res.data.student.id));
    } catch (err) {
      message.error('获取学习进度失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const trainingColumns = [
    { title: '培训日期', dataIndex: 'training_date', key: 'training_date' },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    { title: '学时', dataIndex: 'hours', key: 'hours', render: (v) => `${v} 小时` },
    { title: '教练', key: 'coach', render: (_, r) => r.coach?.user?.name || '-' },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
  ];

  const examColumns = [
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
        return <Tag color="blue">{EXAM_STATUS[r.status]}</Tag>;
      },
    },
  ];

  const completedHours = profile?.completed_hours || 0;
  const totalHours = Math.max(profile?.total_hours || 62, completedHours);
  const progressPercent = totalHours > 0 ? Math.round((completedHours / totalHours) * 100) : 0;

  return (
    <div className="page-container">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="已完成学时"
              value={completedHours}
              suffix="小时"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="总学时"
              value={totalHours}
              suffix="小时"
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="学习状态"
              value={profile?.status === 'graduated' ? '已毕业' : '学习中'}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="学习进度" style={{ marginBottom: 24 }}>
        <AntProgress percent={progressPercent} />
        <p style={{ marginTop: 12, color: '#666' }}>
          已完成 {completedHours} 小时，还需 {Math.max(0, totalHours - completedHours)} 小时
        </p>
      </Card>

      <Card title="学时记录" style={{ marginBottom: 24 }}>
        <Table
          columns={trainingColumns}
          dataSource={trainings}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>

      <Card title="考试记录">
        <Table
          columns={examColumns}
          dataSource={exams}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default StudentProgress;
