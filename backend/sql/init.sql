-- 驾校管理系统数据库初始化脚本

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 学员表
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    id_card VARCHAR(18) UNIQUE NOT NULL,
    license_type VARCHAR(10) NOT NULL,
    enroll_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'learning',
    total_hours DECIMAL(5,1) DEFAULT 0,
    completed_hours DECIMAL(5,1) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 教练表
CREATE TABLE IF NOT EXISTS coaches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    coach_no VARCHAR(20) UNIQUE NOT NULL,
    car_no VARCHAR(20),
    specialty VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 课程表
CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL,
    student_id INTEGER,
    course_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'available',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 学时记录表
CREATE TABLE IF NOT EXISTS training_hours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    coach_id INTEGER NOT NULL,
    course_id INTEGER,
    subject VARCHAR(20) NOT NULL,
    hours DECIMAL(3,1) NOT NULL,
    training_date DATE NOT NULL,
    recorded_by INTEGER NOT NULL,
    remark TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (coach_id) REFERENCES coaches(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- 考试表
CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    subject VARCHAR(20) NOT NULL,
    exam_date DATE NOT NULL,
    exam_time TIME NOT NULL,
    location VARCHAR(100),
    result VARCHAR(20),
    score INTEGER,
    status VARCHAR(20) DEFAULT 'scheduled',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id)
);

-- 财务记录表
CREATE TABLE IF NOT EXISTS finances (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20),
    remark TEXT,
    recorded_by INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (recorded_by) REFERENCES users(id)
);

-- 初始化管理员账号（密码：admin123，需要在应用启动时通过 bcrypt 加密后写入

-- 角色说明：
-- admin: 老板/管理员
-- student: 学员
-- coach: 教练
-- reception: 前台
