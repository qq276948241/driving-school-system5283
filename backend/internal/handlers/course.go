package handlers

import (
	"net/http"
	"project21/backend/internal/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CourseHandler struct {
	db *gorm.DB
}

func NewCourseHandler(db *gorm.DB) *CourseHandler {
	return &CourseHandler{db: db}
}

func (h *CourseHandler) CreateCourse(c *gin.Context) {
	var req models.CreateCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	course := models.Course{
		CoachID:    req.CoachID,
		CourseDate: req.CourseDate,
		StartTime:  req.StartTime,
		EndTime:    req.EndTime,
		Subject:    req.Subject,
		Status:     "available",
	}

	if err := h.db.Create(&course).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建课程失败"})
		return
	}

	c.JSON(http.StatusOK, course)
}

func (h *CourseHandler) ListCourses(c *gin.Context) {
	status := c.Query("status")
	coachID := c.Query("coach_id")
	date := c.Query("date")
	studentID := c.Query("student_id")

	var courses []models.Course
	query := h.db.Preload("Coach.User").Preload("Student.User")

	if status != "" {
		query = query.Where("status = ?", status)
	}
	if coachID != "" {
		query = query.Where("coach_id = ?", coachID)
	}
	if date != "" {
		query = query.Where("course_date = ?", date)
	}
	if studentID != "" {
		query = query.Where("student_id = ?", studentID)
	}

	query.Order("course_date desc, start_time asc").Find(&courses)
	c.JSON(http.StatusOK, courses)
}

func (h *CourseHandler) BookCourse(c *gin.Context) {
	var req models.BookCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := c.GetUint("user_id")

	var student models.Student
	if err := h.db.Where("user_id = ?", userID).First(&student).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "学员信息不存在"})
		return
	}

	var course models.Course
	if err := h.db.First(&course, req.CourseID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
		return
	}

	if course.Status != "available" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "该时段已被预约"})
		return
	}

	course.StudentID = &student.ID
	course.Status = "booked"
	h.db.Save(&course)

	c.JSON(http.StatusOK, gin.H{"message": "预约成功"})
}

func (h *CourseHandler) CancelCourse(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var course models.Course
	if err := h.db.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
		return
	}

	userRole := c.GetString("role")
	userID := c.GetUint("user_id")

	if userRole == "student" {
		var student models.Student
		h.db.Where("user_id = ?", userID).First(&student)
		if course.StudentID == nil || *course.StudentID != student.ID {
			c.JSON(http.StatusForbidden, gin.H{"error": "无权取消该课程"})
			return
		}
	}

	course.StudentID = nil
	course.Status = "available"
	h.db.Save(&course)

	c.JSON(http.StatusOK, gin.H{"message": "取消成功"})
}

func (h *CourseHandler) CompleteCourse(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var course models.Course
	if err := h.db.First(&course, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "课程不存在"})
		return
	}

	course.Status = "completed"
	h.db.Save(&course)

	c.JSON(http.StatusOK, gin.H{"message": "课程已完成"})
}

func (h *CourseHandler) DeleteCourse(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	h.db.Delete(&models.Course{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
