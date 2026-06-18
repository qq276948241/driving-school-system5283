package handlers

import (
	"net/http"
	"project21/backend/internal/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type StatsHandler struct {
	db *gorm.DB
}

func NewStatsHandler(db *gorm.DB) *StatsHandler {
	return &StatsHandler{db: db}
}

func (h *StatsHandler) GetDashboard(c *gin.Context) {
	var totalStudents int64
	h.db.Model(&models.Student{}).Count(&totalStudents)

	var learningStudents int64
	h.db.Model(&models.Student{}).Where("status = ?", "learning").Count(&learningStudents)

	var graduatedStudents int64
	h.db.Model(&models.Student{}).Where("status = ?", "graduated").Count(&graduatedStudents)

	var totalCoaches int64
	h.db.Model(&models.Coach{}).Count(&totalCoaches)

	var totalCourses int64
	h.db.Model(&models.Course{}).Count(&totalCourses)

	var totalHours float64
	h.db.Model(&models.TrainingHour{}).Select("COALESCE(SUM(hours), 0)").Scan(&totalHours)

	var totalExams int64
	h.db.Model(&models.Exam{}).Count(&totalExams)

	var passedExams int64
	h.db.Model(&models.Exam{}).Where("result = ?", "pass").Count(&passedExams)

	passRate := 0.0
	if totalExams > 0 {
		passRate = float64(passedExams) / float64(totalExams) * 100
	}

	var totalIncome float64
	h.db.Model(&models.Finance{}).Where("type = ?", "income").Select("COALESCE(SUM(amount), 0)").Scan(&totalIncome)

	var totalExpense float64
	h.db.Model(&models.Finance{}).Where("type = ?", "expense").Select("COALESCE(SUM(amount), 0)").Scan(&totalExpense)

	c.JSON(http.StatusOK, gin.H{
		"total_students":     totalStudents,
		"learning_students":  learningStudents,
		"graduated_students": graduatedStudents,
		"total_coaches":      totalCoaches,
		"total_courses":      totalCourses,
		"total_training_hours": totalHours,
		"total_exams":        totalExams,
		"passed_exams":       passedExams,
		"pass_rate":          passRate,
		"total_income":       totalIncome,
		"total_expense":      totalExpense,
		"net_profit":         totalIncome - totalExpense,
	})
}

func (h *StatsHandler) GetCoachStats(c *gin.Context) {
	type CoachStat struct {
		CoachID         uint    `json:"coach_id"`
		CoachName       string  `json:"coach_name"`
		CoachNo         string  `json:"coach_no"`
		CarNo           string  `json:"car_no"`
		StudentCount    int64   `json:"student_count"`
		CourseCount     int64   `json:"course_count"`
		TotalHours      float64 `json:"total_hours"`
		PassRate        float64 `json:"pass_rate"`
	}

	var coaches []models.Coach
	h.db.Preload("User").Find(&coaches)

	var stats []CoachStat
	for _, coach := range coaches {
		var studentCount int64
		h.db.Model(&models.Course{}).
			Where("coach_id = ? AND student_id IS NOT NULL", coach.ID).
			Distinct("student_id").
			Count(&studentCount)

		var courseCount int64
		h.db.Model(&models.Course{}).
			Where("coach_id = ?", coach.ID).
			Count(&courseCount)

		var totalHours float64
		h.db.Model(&models.TrainingHour{}).
			Where("coach_id = ?", coach.ID).
			Select("COALESCE(SUM(hours), 0)").
			Scan(&totalHours)

		var examCount int64
		var passCount int64
		var studentIDs []uint
		h.db.Model(&models.TrainingHour{}).
			Where("coach_id = ?", coach.ID).
			Distinct("student_id").
			Pluck("student_id", &studentIDs)

		if len(studentIDs) > 0 {
			h.db.Model(&models.Exam{}).
				Where("student_id IN ? AND status = ?", studentIDs, "completed").
				Count(&examCount)
			h.db.Model(&models.Exam{}).
				Where("student_id IN ? AND result = ?", studentIDs, "pass").
				Count(&passCount)
		}

		passRate := 0.0
		if examCount > 0 {
			passRate = float64(passCount) / float64(examCount) * 100
		}

		stats = append(stats, CoachStat{
			CoachID:      coach.ID,
			CoachName:    coach.User.Name,
			CoachNo:      coach.CoachNo,
			CarNo:        coach.CarNo,
			StudentCount: studentCount,
			CourseCount:  courseCount,
			TotalHours:   totalHours,
			PassRate:     passRate,
		})
	}

	c.JSON(http.StatusOK, stats)
}

func (h *StatsHandler) GetSubjectPassRates(c *gin.Context) {
	subjects := []string{"subject1", "subject2", "subject3", "subject4"}
	subjectNames := map[string]string{
		"subject1": "科目一",
		"subject2": "科目二",
		"subject3": "科目三",
		"subject4": "科目四",
	}

	var results []map[string]interface{}
	for _, subject := range subjects {
		var total int64
		var passed int64
		h.db.Model(&models.Exam{}).Where("subject = ? AND status = ?", subject, "completed").Count(&total)
		h.db.Model(&models.Exam{}).Where("subject = ? AND result = ?", subject, "pass").Count(&passed)

		rate := 0.0
		if total > 0 {
			rate = float64(passed) / float64(total) * 100
		}

		results = append(results, map[string]interface{}{
			"subject":     subject,
			"subject_name": subjectNames[subject],
			"total":       total,
			"passed":      passed,
			"pass_rate":   rate,
		})
	}

	c.JSON(http.StatusOK, results)
}
