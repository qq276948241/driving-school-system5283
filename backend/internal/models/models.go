package models

import (
	"time"
)

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"size:50;uniqueIndex;not null" json:"username"`
	Password  string    `gorm:"size:255;not null" json:"-"`
	Role      string    `gorm:"size:20;not null" json:"role"`
	Name      string    `gorm:"size:50;not null" json:"name"`
	Phone     string    `gorm:"size:20" json:"phone"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
}

type Student struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	User            User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	IDCard          string    `gorm:"size:18;uniqueIndex;not null" json:"id_card"`
	LicenseType     string    `gorm:"size:10;not null" json:"license_type"`
	EnrollDate      string    `gorm:"type:date;not null" json:"enroll_date"`
	Status          string    `gorm:"size:20;default:learning" json:"status"`
	TotalHours      float64   `gorm:"type:decimal(5,1);default:0" json:"total_hours"`
	CompletedHours  float64   `gorm:"type:decimal(5,1);default:0" json:"completed_hours"`
	CreatedAt       time.Time `json:"created_at"`
}

type Coach struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex;not null" json:"user_id"`
	User      User      `gorm:"foreignKey:UserID" json:"user,omitempty"`
	CoachNo   string    `gorm:"size:20;uniqueIndex;not null" json:"coach_no"`
	CarNo     string    `gorm:"size:20" json:"car_no"`
	Specialty string    `gorm:"size:100" json:"specialty"`
	CreatedAt time.Time `json:"created_at"`
}

type Course struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	CoachID    uint      `gorm:"not null" json:"coach_id"`
	Coach      Coach     `gorm:"foreignKey:CoachID" json:"coach,omitempty"`
	StudentID  *uint     `json:"student_id"`
	Student    *Student  `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	CourseDate string    `gorm:"type:date;not null" json:"course_date"`
	StartTime  string    `gorm:"type:time;not null" json:"start_time"`
	EndTime    string    `gorm:"type:time;not null" json:"end_time"`
	Subject    string    `gorm:"size:20;not null" json:"subject"`
	Status     string    `gorm:"size:20;default:available" json:"status"`
	CreatedAt  time.Time `json:"created_at"`
}

type TrainingHour struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	StudentID    uint      `gorm:"not null" json:"student_id"`
	Student      Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	CoachID      uint      `gorm:"not null" json:"coach_id"`
	Coach        Coach     `gorm:"foreignKey:CoachID" json:"coach,omitempty"`
	CourseID     *uint     `json:"course_id"`
	Subject      string    `gorm:"size:20;not null" json:"subject"`
	Hours        float64   `gorm:"type:decimal(3,1);not null" json:"hours"`
	TrainingDate string    `gorm:"type:date;not null" json:"training_date"`
	RecordedBy   uint      `gorm:"not null" json:"recorded_by"`
	Remark       string    `gorm:"type:text" json:"remark"`
	CreatedAt    time.Time `json:"created_at"`
}

type Exam struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	StudentID uint      `gorm:"not null" json:"student_id"`
	Student   Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Subject   string    `gorm:"size:20;not null" json:"subject"`
	ExamDate  string    `gorm:"type:date;not null" json:"exam_date"`
	ExamTime  string    `gorm:"type:time;not null" json:"exam_time"`
	Location  string    `gorm:"size:100" json:"location"`
	Result    string    `gorm:"size:20" json:"result"`
	Score     int       `json:"score"`
	Status    string    `gorm:"size:20;default:scheduled" json:"status"`
	CreatedAt time.Time `json:"created_at"`
}

type Finance struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	StudentID     uint      `gorm:"not null" json:"student_id"`
	Student       Student   `gorm:"foreignKey:StudentID" json:"student,omitempty"`
	Type          string    `gorm:"size:20;not null" json:"type"`
	Amount        float64   `gorm:"type:decimal(10,2);not null" json:"amount"`
	PaymentMethod string    `gorm:"size:20" json:"payment_method"`
	Remark        string    `gorm:"type:text" json:"remark"`
	RecordedBy    uint      `gorm:"not null" json:"recorded_by"`
	CreatedAt     time.Time `json:"created_at"`
}

type LoginRequest struct {
	Username string `json:"username" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type LoginResponse struct {
	Token string `json:"token"`
	User  User   `json:"user"`
}

type RegisterStudentRequest struct {
	Username    string `json:"username" binding:"required"`
	Password    string `json:"password" binding:"required"`
	Name        string `json:"name" binding:"required"`
	Phone       string `json:"phone"`
	IDCard      string `json:"id_card" binding:"required"`
	LicenseType string `json:"license_type" binding:"required"`
}

type CreateCourseRequest struct {
	CoachID    uint   `json:"coach_id" binding:"required"`
	CourseDate string `json:"course_date" binding:"required"`
	StartTime  string `json:"start_time" binding:"required"`
	EndTime    string `json:"end_time" binding:"required"`
	Subject    string `json:"subject" binding:"required"`
}

type BookCourseRequest struct {
	CourseID uint `json:"course_id" binding:"required"`
}

type RecordHoursRequest struct {
	StudentID    uint    `json:"student_id" binding:"required"`
	CoachID      uint    `json:"coach_id" binding:"required"`
	Subject      string  `json:"subject" binding:"required"`
	Hours        float64 `json:"hours" binding:"required"`
	TrainingDate string  `json:"training_date" binding:"required"`
	Remark       string  `json:"remark"`
}

type CreateExamRequest struct {
	StudentID uint   `json:"student_id" binding:"required"`
	Subject   string `json:"subject" binding:"required"`
	ExamDate  string `json:"exam_date" binding:"required"`
	ExamTime  string `json:"exam_time" binding:"required"`
	Location  string `json:"location"`
}

type UpdateExamResultRequest struct {
	Result string `json:"result" binding:"required"`
	Score  int    `json:"score"`
}

type CreateFinanceRequest struct {
	StudentID     uint    `json:"student_id" binding:"required"`
	Type          string  `json:"type" binding:"required"`
	Amount        float64 `json:"amount" binding:"required"`
	PaymentMethod string  `json:"payment_method"`
	Remark        string  `json:"remark"`
}
