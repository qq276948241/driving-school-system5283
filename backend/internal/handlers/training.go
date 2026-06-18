package handlers

import (
	"net/http"
	"project21/backend/internal/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type TrainingHandler struct {
	db *gorm.DB
}

func NewTrainingHandler(db *gorm.DB) *TrainingHandler {
	return &TrainingHandler{db: db}
}

func (h *TrainingHandler) RecordHours(c *gin.Context) {
	var req models.RecordHoursRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recordedBy := c.GetUint("user_id")

	tx := h.db.Begin()

	record := models.TrainingHour{
		StudentID:    req.StudentID,
		CoachID:      req.CoachID,
		Subject:      req.Subject,
		Hours:        req.Hours,
		TrainingDate: req.TrainingDate,
		RecordedBy:   recordedBy,
		Remark:       req.Remark,
	}
	if err := tx.Create(&record).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "记录学时失败"})
		return
	}

	var student models.Student
	if err := tx.First(&student, req.StudentID).Error; err == nil {
		student.CompletedHours += req.Hours
		tx.Save(&student)
	}

	tx.Commit()
	c.JSON(http.StatusOK, record)
}

func (h *TrainingHandler) ListTrainingHours(c *gin.Context) {
	studentID := c.Query("student_id")
	coachID := c.Query("coach_id")

	var records []models.TrainingHour
	query := h.db.Preload("Student.User").Preload("Coach.User")

	if studentID != "" {
		query = query.Where("student_id = ?", studentID)
	}
	if coachID != "" {
		query = query.Where("coach_id = ?", coachID)
	}

	query.Order("training_date desc, created_at desc").Find(&records)
	c.JSON(http.StatusOK, records)
}

func (h *TrainingHandler) GetStudentProgress(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var student models.Student
	if role == "student" {
		h.db.Where("user_id = ?", userID).Preload("User").First(&student)
	} else {
		id, _ := strconv.Atoi(c.Param("id"))
		h.db.Preload("User").First(&student, id)
	}

	var trainingRecords []models.TrainingHour
	h.db.Where("student_id = ?", student.ID).
		Preload("Coach.User").
		Order("training_date desc").
		Find(&trainingRecords)

	var exams []models.Exam
	h.db.Where("student_id = ?", student.ID).Order("exam_date desc").Find(&exams)

	c.JSON(http.StatusOK, gin.H{
		"student":   student,
		"trainings": trainingRecords,
		"exams":     exams,
	})
}

func (h *TrainingHandler) ListCoachStudents(c *gin.Context) {
	userID := c.GetUint("user_id")
	role := c.GetString("role")

	var coachID uint
	if role == "coach" {
		var coach models.Coach
		h.db.Where("user_id = ?", userID).First(&coach)
		coachID = coach.ID
	} else {
		id, _ := strconv.Atoi(c.Param("id"))
		coachID = uint(id)
	}

	var studentIDs []uint
	h.db.Model(&models.TrainingHour{}).
		Where("coach_id = ?", coachID).
		Distinct("student_id").
		Pluck("student_id", &studentIDs)

	var courseStudentIDs []uint
	h.db.Model(&models.Course{}).
		Where("coach_id = ? AND student_id IS NOT NULL", coachID).
		Distinct("student_id").
		Pluck("student_id", &courseStudentIDs)

	allIDs := make(map[uint]bool)
	for _, id := range studentIDs {
		allIDs[id] = true
	}
	for _, id := range courseStudentIDs {
		allIDs[id] = true
	}

	var ids []uint
	for id := range allIDs {
		ids = append(ids, id)
	}

	var students []models.Student
	if len(ids) > 0 {
		h.db.Preload("User").Where("id IN ?", ids).Find(&students)
	}

	c.JSON(http.StatusOK, students)
}
