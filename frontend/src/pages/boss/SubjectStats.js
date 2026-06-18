import React, { useEffect, useState } from 'react';
import { Table, Progress, Row, Col, Card, Statistic, message } from 'antd';
import { statsApi } from '../../services';

const SubjectStats = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await statsApi.getSubjectPassRates();
      setData(res.data);
    } catch (err) {
      message.error('获取统计数据失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns = [
    { title: '科目', dataIndex: 'subject_name', key: 'subject_name' },
    { title: '考试人数', dataIndex: 'total', key: 'total', sorter: (a, b) => a.total - b.total },
    { title: '通过人数', dataIndex: 'passed', key: 'passed', sorter: (a, b) => a.passed - b.passed },
    {
      title: '通过率',
      dataIndex: 'pass_rate',
      key: 'pass_rate',
      sorter: (a, b) => a.pass_rate - b.pass_rate,
      render: (v) => (
        <Progress
          percent={Math.round(v)}
          status={v >= 70 ? 'normal' : 'exception'}
        />
      ),
    },
  ];

  const totalExams = data.reduce((sum, d) => sum + d.total, 0);
  const totalPassed = data.reduce((sum, d) => sum + d.passed, 0);
  const avgRate = totalExams > 0 ? (totalPassed / totalExams * 100) : 0;

  return (
    <div className="page-container">
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic title="总考试场次" value={totalExams} />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic title="总通过场次" value={totalPassed} />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="整体通过率"
              value={avgRate}
              precision={1}
              suffix="%"
              valueStyle={{ color: avgRate >= 70 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
      </Row>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="subject"
        loading={loading}
        pagination={false}
      />
    </div>
  );
};

export default SubjectStats;
