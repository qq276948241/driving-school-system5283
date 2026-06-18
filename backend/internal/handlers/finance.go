package handlers

import (
	"net/http"
	"project21/backend/internal/models"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type FinanceHandler struct {
	db *gorm.DB
}

func NewFinanceHandler(db *gorm.DB) *FinanceHandler {
	return &FinanceHandler{db: db}
}

func (h *FinanceHandler) CreateRecord(c *gin.Context) {
	var req models.CreateFinanceRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	recordedBy := c.GetUint("user_id")

	record := models.Finance{
		StudentID:     req.StudentID,
		Type:          req.Type,
		Amount:        req.Amount,
		PaymentMethod: req.PaymentMethod,
		Remark:        req.Remark,
		RecordedBy:    recordedBy,
	}

	if err := h.db.Create(&record).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建财务记录失败"})
		return
	}

	c.JSON(http.StatusOK, record)
}

func (h *FinanceHandler) ListRecords(c *gin.Context) {
	studentID := c.Query("student_id")
	recordType := c.Query("type")
	startDate := c.Query("start_date")
	endDate := c.Query("end_date")

	var records []models.Finance
	query := h.db.Preload("Student.User")

	if studentID != "" {
		query = query.Where("student_id = ?", studentID)
	}
	if recordType != "" {
		query = query.Where("type = ?", recordType)
	}
	if startDate != "" {
		query = query.Where("date(created_at) >= ?", startDate)
	}
	if endDate != "" {
		query = query.Where("date(created_at) <= ?", endDate)
	}

	query.Order("created_at desc").Find(&records)

	var totalIncome, totalExpense float64
	for _, r := range records {
		if r.Type == "income" {
			totalIncome += r.Amount
		} else {
			totalExpense += r.Amount
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"records":      records,
		"total_income": totalIncome,
		"total_expense": totalExpense,
		"net_profit":   totalIncome - totalExpense,
	})
}

func (h *FinanceHandler) DeleteRecord(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	h.db.Delete(&models.Finance{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}

func (h *FinanceHandler) GetStudentFinance(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))

	var records []models.Finance
	h.db.Where("student_id = ?", id).Order("created_at desc").Find(&records)

	var totalPaid float64
	for _, r := range records {
		if r.Type == "income" {
			totalPaid += r.Amount
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"records":    records,
		"total_paid": totalPaid,
	})
}
