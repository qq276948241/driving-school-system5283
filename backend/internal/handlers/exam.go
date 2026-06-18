package handlers

import (
	"net/http"
	"project21/backend/internal/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ExamHandler struct {
	db *gorm.DB
}

func NewExamHandler(db *gorm.DB) *ExamHandler {
	return &ExamHandler{db: db}
}

func (h *ExamHandler) CreateExam(c *gin.Context) {
	var req models.CreateExamRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	exam := models.Exam{
		StudentID: req.StudentID,
		Subject:   req.Subject,
		ExamDate:  req.ExamDate,
		ExamTime:  req.ExamTime,
		Location:  req.Location,
		Status:    "scheduled",
	}

	if err := h.db.Create(&exam).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建考试失败"})
		return
	}

	c.JSON(http.StatusOK, exam)
}

func (h *ExamHandler) ListExams(c *gin.Context) {
	studentID := c.Query("student_id")
	status := c.Query("status")
	subject := c.Query("subject")

	var exams []models.Exam
	query := h.db.Preload("Student.User")

	if studentID != "" {
		query = query.Where("student_id = ?", studentID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	if subject != "" {
		query = query.Where("subject = ?", subject)
	}

	query.Order("exam_date desc, exam_time asc").Find(&exams)
	c.JSON(http.StatusOK, exams)
}

func (h *ExamHandler) UpdateExamResult(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var req models.UpdateExamResultRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var exam models.Exam
	if err := h.db.First(&exam, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "考试记录不存在"})
		return
	}

	exam.Result = req.Result
	exam.Score = req.Score
	exam.Status = "completed"
	h.db.Save(&exam)

	if req.Result == "pass" {
		var student models.Student
		h.db.First(&student, exam.StudentID)
		if exam.Subject == "subject4" {
			student.Status = "graduated"
			h.db.Save(&student)
		}
	}

	c.JSON(http.StatusOK, exam)
}

func (h *ExamHandler) DeleteExam(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	h.db.Delete(&models.Exam{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
