package main

import (
	"log"
	"project21/backend/internal/config"
	"project21/backend/internal/handlers"
	"project21/backend/internal/middleware"
	"project21/backend/internal/models"
	"project21/backend/internal/utils"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	_ "modernc.org/sqlite"
)

func main() {
	cfg := config.Load()

	db, err := gorm.Open(sqlite.Dialector{
		DSN:        cfg.DSN,
		DriverName: "sqlite",
	}, &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	db.AutoMigrate(
		&models.User{},
		&models.Student{},
		&models.Coach{},
		&models.Course{},
		&models.TrainingHour{},
		&models.Exam{},
		&models.Finance{},
	)

	initAdminUser(db)

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	authHandler := handlers.NewAuthHandler(db)
	courseHandler := handlers.NewCourseHandler(db)
	trainingHandler := handlers.NewTrainingHandler(db)
	examHandler := handlers.NewExamHandler(db)
	financeHandler := handlers.NewFinanceHandler(db)
	statsHandler := handlers.NewStatsHandler(db)

	api := r.Group("/api")
	{
		api.POST("/login", authHandler.Login)
		api.POST("/register/student", authHandler.RegisterStudent)

		auth := api.Group("")
		auth.Use(middleware.AuthMiddleware())
		{
			auth.GET("/profile", authHandler.GetProfile)

			auth.GET("/coaches", authHandler.ListCoaches)
			auth.GET("/students", authHandler.ListStudents)

			courses := auth.Group("/courses")
			{
				courses.GET("", courseHandler.ListCourses)
				courses.POST("", middleware.RoleMiddleware("admin", "reception", "coach"), courseHandler.CreateCourse)
				courses.POST("/book", middleware.RoleMiddleware("student"), courseHandler.BookCourse)
				courses.POST("/:id/cancel", courseHandler.CancelCourse)
				courses.POST("/:id/complete", middleware.RoleMiddleware("admin", "reception", "coach"), courseHandler.CompleteCourse)
				courses.DELETE("/:id", middleware.RoleMiddleware("admin", "reception"), courseHandler.DeleteCourse)
			}

			training := auth.Group("/training")
			{
				training.GET("", trainingHandler.ListTrainingHours)
				training.POST("", middleware.RoleMiddleware("admin", "reception", "coach"), trainingHandler.RecordHours)
				training.GET("/progress", middleware.RoleMiddleware("student"), trainingHandler.GetStudentProgress)
				training.GET("/progress/:id", middleware.RoleMiddleware("admin", "reception", "coach"), trainingHandler.GetStudentProgress)
				training.GET("/coach-students", middleware.RoleMiddleware("admin", "reception", "coach"), trainingHandler.ListCoachStudents)
				training.GET("/coach-students/:id", middleware.RoleMiddleware("admin", "reception"), trainingHandler.ListCoachStudents)
			}

			exams := auth.Group("/exams")
			{
				exams.GET("", examHandler.ListExams)
				exams.POST("", middleware.RoleMiddleware("admin", "reception"), examHandler.CreateExam)
				exams.PUT("/:id/result", middleware.RoleMiddleware("admin", "reception"), examHandler.UpdateExamResult)
				exams.DELETE("/:id", middleware.RoleMiddleware("admin", "reception"), examHandler.DeleteExam)
			}

			finances := auth.Group("/finances")
			{
				finances.GET("", middleware.RoleMiddleware("admin", "reception"), financeHandler.ListRecords)
				finances.POST("", middleware.RoleMiddleware("admin", "reception"), financeHandler.CreateRecord)
				finances.DELETE("/:id", middleware.RoleMiddleware("admin"), financeHandler.DeleteRecord)
				finances.GET("/student/:id", financeHandler.GetStudentFinance)
			}

			stats := auth.Group("/stats")
			stats.Use(middleware.RoleMiddleware("admin"))
			{
				stats.GET("/dashboard", statsHandler.GetDashboard)
				stats.GET("/coaches", statsHandler.GetCoachStats)
				stats.GET("/subjects", statsHandler.GetSubjectPassRates)
			}

			users := auth.Group("/users")
			users.Use(middleware.RoleMiddleware("admin"))
			{
				users.GET("", authHandler.ListUsers)
				users.POST("", authHandler.CreateUser)
				users.DELETE("/:id", authHandler.DeleteUser)
			}
		}
	}

	log.Println("Server starting on port", cfg.Port)
	r.Run(cfg.Port)
}

func initAdminUser(db *gorm.DB) {
	var count int64
	db.Model(&models.User{}).Where("role = ?", "admin").Count(&count)
	if count == 0 {
		hashedPassword, _ := utils.HashPassword("admin123")
		admin := models.User{
			Username: "admin",
			Password: hashedPassword,
			Role:     "admin",
			Name:     "管理员",
			Phone:    "13800138000",
		}
		db.Create(&admin)
		log.Println("Default admin user created: admin/admin123")
	}
}
