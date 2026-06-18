import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Progress, Tag, message } from 'antd';
import { trainingApi } from '../../services';
import { SUBJECTS } from '../../utils/constants';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await trainingApi.listCoachStudents();
      setStudents(res.data);
    } catch (err) {
      message.error('获取学员列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleViewDetail = async (record) => {
    setSelectedStudent(record);
    try {
      const res = await trainingApi.getProgress(record.id);
      setProgress(res.data);
      setDetailModal(true);
    } catch (err) {
      message.error('获取学员进度失败');
    }
  };

  const getStatusTag = (status) => {
    const colors = { learning: 'blue', graduated: 'green', dropped: 'red' };
    const labels = { learning: '学习中', graduated: '已毕业', dropped: '已退学' };
    return <Tag color={colors[status]}>{labels[status] || status}</Tag>;
  };

  const columns = [
    { title: '姓名', key: 'name', render: (_, r) => r.user?.name },
    { title: '手机号', key: 'phone', render: (_, r) => r.user?.phone || '-' },
    { title: '身份证号', dataIndex: 'id_card', key: 'id_card' },
    { title: '准驾车型', dataIndex: 'license_type', key: 'license_type' },
    { title: '已完成学时', dataIndex: 'completed_hours', key: 'completed_hours', render: (v) => `${v} 小时` },
    { title: '状态', key: 'status', render: (_, r) => getStatusTag(r.status) },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" size="small" onClick={() => handleViewDetail(record)}>
          查看详情
        </Button>
      ),
    },
  ];

  const trainingColumns = [
    { title: '培训日期', dataIndex: 'training_date', key: 'training_date' },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    { title: '学时', dataIndex: 'hours', key: 'hours', render: (v) => `${v} 小时` },
  ];

  const examColumns = [
    { title: '考试日期', dataIndex: 'exam_date', key: 'exam_date' },
    { title: '科目', dataIndex: 'subject', key: 'subject', render: (v) => SUBJECTS.find(s => s.value === v)?.label },
    {
      title: '结果',
      key: 'result',
      render: (_, r) => r.status === 'completed' ? (
        <Tag color={r.result === 'pass' ? 'green' : 'red'}>
          {r.result === 'pass' ? '通过' : '未通过'}
        </Tag>
      ) : <Tag color="blue">待考试</Tag>,
    },
  ];

  return (
    <div className="page-container">
      <Table
        columns={columns}
        dataSource={students}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title="学员学习详情"
        open={detailModal}
        onCancel={() => { setDetailModal(false); setSelectedStudent(null); setProgress(null); }}
        footer={null}
        width={700}
      >
        {progress && (
          <div>
            <p>姓名：{progress.student.user?.name}</p>
            <p>准驾车型：{progress.student.license_type}</p>
            <p>已完成 {progress.student.completed_hours} 小时</p>
            <Progress
              percent={Math.min(100, Math.round((progress.student.completed_hours / 62) * 100))}
              style={{ marginBottom: 20 }}
            />

            <h4>学时记录</h4>
            <Table
              columns={trainingColumns}
              dataSource={progress.trainings}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />

            <h4 style={{ marginTop: 20 }}>考试记录</h4>
            <Table
              columns={examColumns}
              dataSource={progress.exams}
              rowKey="id"
              pagination={{ pageSize: 5 }}
              size="small"
            />
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Students;
