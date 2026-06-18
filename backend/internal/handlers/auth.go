package handlers

import (
	"net/http"
	"project21/backend/internal/models"
	"project21/backend/internal/utils"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AuthHandler struct {
	db *gorm.DB
}

func NewAuthHandler(db *gorm.DB) *AuthHandler {
	return &AuthHandler{db: db}
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if err := h.db.Where("username = ?", req.Username).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	if !utils.CheckPasswordHash(req.Password, user.Password) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "用户名或密码错误"})
		return
	}

	token, err := utils.GenerateToken(user.ID, user.Username, user.Role, 24)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "生成token失败"})
		return
	}

	c.JSON(http.StatusOK, models.LoginResponse{
		Token: token,
		User:  user,
	})
}

func (h *AuthHandler) RegisterStudent(c *gin.Context) {
	var req models.RegisterStudentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, err := utils.HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	tx := h.db.Begin()

	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Role:     "student",
		Name:     req.Name,
		Phone:    req.Phone,
	}
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户名已存在"})
		return
	}

	student := models.Student{
		UserID:      user.ID,
		IDCard:      req.IDCard,
		LicenseType: req.LicenseType,
		EnrollDate:  time.Now().Format("2006-01-02"),
		Status:      "learning",
		TotalHours:  0,
	}
	if err := tx.Create(&student).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "身份证号已存在"})
		return
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "注册成功", "user_id": user.ID})
}

func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID := c.GetUint("user_id")
	var user models.User
	if err := h.db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	role := c.GetString("role")
	response := gin.H{"user": user}

	switch role {
	case "student":
		var student models.Student
		h.db.Where("user_id = ?", userID).First(&student)
		response["student"] = student
	case "coach":
		var coach models.Coach
		h.db.Where("user_id = ?", userID).Preload("User").First(&coach)
		response["coach"] = coach
	}

	c.JSON(http.StatusOK, response)
}

func (h *AuthHandler) CreateUser(c *gin.Context) {
	var req struct {
		Username  string `json:"username" binding:"required"`
		Password  string `json:"password" binding:"required"`
		Role      string `json:"role" binding:"required"`
		Name      string `json:"name" binding:"required"`
		Phone     string `json:"phone"`
		CoachNo   string `json:"coach_no"`
		CarNo     string `json:"car_no"`
		Specialty string `json:"specialty"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	hashedPassword, _ := utils.HashPassword(req.Password)

	tx := h.db.Begin()

	user := models.User{
		Username: req.Username,
		Password: hashedPassword,
		Role:     req.Role,
		Name:     req.Name,
		Phone:    req.Phone,
	}
	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusBadRequest, gin.H{"error": "用户名已存在"})
		return
	}

	if req.Role == "coach" {
		coach := models.Coach{
			UserID:    user.ID,
			CoachNo:   req.CoachNo,
			CarNo:     req.CarNo,
			Specialty: req.Specialty,
		}
		if err := tx.Create(&coach).Error; err != nil {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "教练编号已存在"})
			return
		}
	}

	tx.Commit()
	c.JSON(http.StatusOK, gin.H{"message": "创建成功", "user_id": user.ID})
}

func (h *AuthHandler) ListUsers(c *gin.Context) {
	role := c.Query("role")
	var users []models.User
	query := h.db
	if role != "" {
		query = query.Where("role = ?", role)
	}
	query.Find(&users)
	c.JSON(http.StatusOK, users)
}

func (h *AuthHandler) ListCoaches(c *gin.Context) {
	var coaches []models.Coach
	h.db.Preload("User").Find(&coaches)
	c.JSON(http.StatusOK, coaches)
}

func (h *AuthHandler) ListStudents(c *gin.Context) {
	var students []models.Student
	h.db.Preload("User").Find(&students)
	c.JSON(http.StatusOK, students)
}

func (h *AuthHandler) DeleteUser(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	h.db.Delete(&models.User{}, id)
	c.JSON(http.StatusOK, gin.H{"message": "删除成功"})
}
