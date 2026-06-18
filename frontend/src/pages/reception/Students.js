import React, { useEffect, useState } from 'react';
import { Table, Tag, Button, Modal, Progress, message } from 'antd';
import { authApi, trainingApi, financeApi } from '../../services';
import { COURSE_STATUS } from '../../utils/constants';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [progress, setProgress] = useState(null);
  const [finances, setFinances] = useState(null);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await authApi.listStudents();
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
      const [progressRes, financeRes] = await Promise.all([
        trainingApi.getProgress(record.id),
        financeApi.getStudentFinance(record.id),
      ]);
      setProgress(progressRes.data);
      setFinances(financeRes.data);
      setDetailModal(true);
    } catch (err) {
      message.error('获取学员详情失败');
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
    { title: '报名日期', dataIndex: 'enroll_date', key: 'enroll_date' },
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
    { title: '科目', dataIndex: 'subject', key: 'subject' },
    { title: '学时', dataIndex: 'hours', key: 'hours', render: (v) => `${v}h` },
    { title: '教练', key: 'coach', render: (_, r) => r.coach?.user?.name || '-' },
  ];

  const financeColumns = [
    { title: '日期', key: 'date', render: (_, r) => r.created_at?.split('T')[0] },
    { title: '类型', dataIndex: 'type', key: 'type', render: (v) => v === 'income' ? '收款' : '支出' },
    { title: '金额', dataIndex: 'amount', key: 'amount', render: (v) => `¥${v.toFixed(2)}` },
    { title: '备注', dataIndex: 'remark', key: 'remark' },
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
        title="学员详情"
        open={detailModal}
        onCancel={() => { setDetailModal(false); setSelectedStudent(null); setProgress(null); setFinances(null); }}
        footer={null}
        width={800}
      >
        {progress && selectedStudent && (
          <div>
            <p>姓名：{selectedStudent.user?.name}</p>
            <p>手机号：{selectedStudent.user?.phone || '-'}</p>
            <p>身份证号：{selectedStudent.id_card}</p>
            <p>准驾车型：{selectedStudent.license_type}</p>
            <p>已完成 {selectedStudent.completed_hours} / 62 小时</p>
            <Progress
              percent={Math.min(100, Math.round((selectedStudent.completed_hours / 62) * 100))}
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

            <h4 style={{ marginTop: 20 }}>缴费记录（已缴 ¥{finances?.total_paid?.toFixed(2) || '0.00'}）</h4>
            <Table
              columns={financeColumns}
              dataSource={finances?.records || []}
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
