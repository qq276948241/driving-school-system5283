import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, message } from 'antd';
import {
  TeamOutlined,
  UserOutlined,
  BookOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { statsApi } from '../../services';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await statsApi.getDashboard();
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

  return (
    <div className="page-container">
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="学员总数"
              value={data?.total_students || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="在读学员"
              value={data?.learning_students || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="已毕业学员"
              value={data?.graduated_students || 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="教练总数"
              value={data?.total_coaches || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="课程总数"
              value={data?.total_courses || 0}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="累计培训学时"
              value={data?.total_training_hours || 0}
              suffix="小时"
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="考试通过率"
              value={data?.pass_rate || 0}
              precision={1}
              suffix="%"
              prefix={<RiseOutlined />}
              valueStyle={{ color: data?.pass_rate >= 70 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="stat-card">
            <Statistic
              title="净利润"
              value={data?.net_profit || 0}
              precision={2}
              prefix={<DollarOutlined style={{ color: data?.net_profit >= 0 ? '#52c41a' : '#ff4d4f' }} />}
              valueStyle={{ color: data?.net_profit >= 0 ? '#52c41a' : '#ff4d4f' }}
            />
          </Card>
        </Col>

        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="总收入"
              value={data?.total_income || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="总支出"
              value={data?.total_expense || 0}
              precision={2}
              prefix="¥"
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="stat-card">
            <Statistic
              title="考试场次"
              value={data?.total_exams || 0}
              suffix={`场（通过 ${data?.passed_exams || 0} 场）`}
              prefix={<RiseOutlined />}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
