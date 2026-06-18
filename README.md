# 驾校管理系统

一个完整的驾校管理系统，基于 Go (Gin + GORM) 后端 和 React (Ant Design) 前端开发。

## 功能模块

### 学员端
- 在线预约练车时段
- 按教练、日期、科目筛选课程
- 查看我的课程记录，支持取消预约
- 查看学习进度（学时、考试记录）

### 教练端
- 查看个人排班（课程表）
- 查看自己带教的学员列表和学习详情
- 发布新课程（设置日期、时段、科目）
- 标记已完成的课程

### 前台端
- 学员管理（查看学员详情、学时、缴费记录）
- 学时登记（为学员登记培训学时）
- 考试安排（安排考试、录入成绩）
- 财务对账（收支记录、收款、支出管理）

### 老板/管理员端
- 数据概览（学员总数、教练数、收入支出、通过率等）
- 教练统计（每位教练的带教人数、学时、通过率）
- 各科目通过率统计
- 用户管理（创建管理员、前台、教练账号）

## 技术栈

**后端：**
- Go 1.21+
- Gin (Web 框架)
- GORM (ORM)
- SQLite (数据库，可替换为 MySQL)
- JWT (认证)
- bcrypt (密码加密)

**前端：**
- React 18
- React Router 6
- Ant Design 5
- Axios
- dayjs

## 快速启动

### 1. 启动后端

```bash
cd backend
go mod tidy
go run ./cmd
# 或编译后运行
go build -o server.exe ./cmd
./server.exe
```

后端默认监听端口 `8000`，首次启动会自动初始化 SQLite 数据库并创建默认管理员账号。

### 2. 启动前端

```bash
cd frontend
npm install
npm start
```

前端默认运行在 `http://localhost:3000`，已配置代理转发后端 API。

## 默认账号

| 角色 | 用户名 | 密码 |
|------|--------|------|
| 管理员/老板 | admin | admin123 |

学员可在登录页点击"学员注册"自行注册账号。管理员可在用户管理中创建教练、前台、管理员账号。

## 项目结构

```
project21/
├── backend/                    # Go 后端
│   ├── cmd/
│   │   └── main.go            # 程序入口
│   ├── internal/
│   │   ├── config/            # 配置
│   │   ├── models/            # 数据模型
│   │   ├── handlers/          # API 处理器
│   │   ├── middleware/        # 中间件
│   │   └── utils/             # 工具函数
│   ├── sql/                   # SQL 初始化脚本
│   └── go.mod
└── frontend/                   # React 前端
    ├── public/
    └── src/
        ├── components/        # 公共组件
        ├── pages/             # 页面
        │   ├── student/       # 学员端页面
        │   ├── coach/         # 教练端页面
        │   ├── reception/     # 前台端页面
        │   └── boss/          # 管理员端页面
        ├── services/          # API 服务
        └── utils/             # 工具函数
```

## API 说明

所有 API 以 `/api` 为前缀，除登录注册外都需要在请求头携带 `Authorization: Bearer <token>`。

主要接口：

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/login | 登录 | 公开 |
| POST | /api/register/student | 学员注册 | 公开 |
| GET | /api/courses | 获取课程列表 | 所有登录用户 |
| POST | /api/courses/book | 学员预约课程 | 学员 |
| POST | /api/training | 登记学时 | 前台/教练/管理员 |
| POST | /api/exams | 安排考试 | 前台/管理员 |
| PUT | /api/exams/:id/result | 录入考试成绩 | 前台/管理员 |
| GET | /api/finances | 获取财务记录 | 前台/管理员 |
| GET | /api/stats/dashboard | 获取看板数据 | 管理员 |
| GET | /api/stats/coaches | 获取教练统计 | 管理员 |
