package handlers

import (
	"net/http"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"
	"fastwork-backend/internal/utils"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type RegisterInput struct {
	Username string `json:"username" binding:"required"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=6"`
	FullName string `json:"full_name" binding:"required"`
	Role     string `json:"role"` // freelancer or client
}

type LoginInput struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Register(c *gin.Context) {
	var input RegisterInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	if input.Role == "" {
		input.Role = "client"
	}
	if input.Role != "freelancer" && input.Role != "client" {
		input.Role = "client"
	}
	hashed, _ := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	user := models.User{
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashed),
		FullName: input.FullName,
		Role:     input.Role,
		Avatar:   "https://i.pravatar.cc/150?u=" + input.Username,
		Rating:   5.0,
	}
	if err := config.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email atau username sudah terdaftar"})
		return
	}
	token, _ := utils.GenerateToken(user.ID, user.Role)
	c.JSON(http.StatusCreated, gin.H{"token": token, "user": user})
}

func Login(c *gin.Context) {
	var input LoginInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := config.DB.Where("email = ?", input.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email tidak ditemukan"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Password salah"})
		return
	}
	token, _ := utils.GenerateToken(user.ID, user.Role)
	c.JSON(http.StatusOK, gin.H{"token": token, "user": user})
}

func Me(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var user models.User
	if err := config.DB.First(&user, uid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	c.JSON(http.StatusOK, user)
}

type UpdateMeInput struct {
	FullName string `json:"full_name"`
	Username string `json:"username"`
	Location string `json:"location"`
	Bio      string `json:"bio"`
	Avatar   string `json:"avatar"`
	Email    string `json:"email"`
}

func UpdateMe(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var input UpdateMeInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var user models.User
	if err := config.DB.First(&user, uid).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if input.FullName != "" {
		user.FullName = input.FullName
	}
	if input.Location != "" {
		user.Location = input.Location
	}
	if input.Bio != "" {
		user.Bio = input.Bio
	}
	if input.Avatar != "" {
		user.Avatar = input.Avatar
	}
	if input.Email != "" && input.Email != user.Email {
		var count int64
		config.DB.Model(&models.User{}).Where("email = ? AND id != ?", input.Email, user.ID).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah digunakan akun lain"})
			return
		}
		user.Email = input.Email
	}
	if input.Username != "" && input.Username != user.Username {
		var count int64
		config.DB.Model(&models.User{}).Where("username = ? AND id != ?", input.Username, user.ID).Count(&count)
		if count > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Username sudah digunakan"})
			return
		}
		user.Username = input.Username
	}
	config.DB.Save(&user)
	c.JSON(http.StatusOK, user)
}
