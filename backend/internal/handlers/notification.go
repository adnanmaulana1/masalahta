package handlers

import (
	"net/http"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"
	"fastwork-backend/internal/realtime"

	"github.com/gin-gonic/gin"
)

func Notify(userID uint, typ, title, desc, link string) {
	config.DB.Create(&models.Notification{UserID: userID, Type: typ, Title: title, Desc: desc, Link: link})
	realtime.Hub.Send(userID, "notify", nil)
}

// NotifyChat menggabung semua notif pesan jadi satu: update yg belum dibaca, bukan bikin baru.
func NotifyChat(userID uint, senderName, body string) {
	var existing models.Notification
	err := config.DB.Where("user_id = ? AND type = ? AND link = ? AND `read` = ?", userID, "chat", "/messages", false).
		Order("created_at DESC").First(&existing).Error
	if err == nil {
		config.DB.Model(&existing).Updates(map[string]interface{}{
			"title": "Pesan baru", "desc": senderName + ": " + body,
		})
		// gabungkan sisa yg lama agar tinggal satu
		config.DB.Model(&models.Notification{}).
			Where("user_id = ? AND type = ? AND link = ? AND `read` = ? AND id <> ?", userID, "chat", "/messages", false, existing.ID).
			Update("read", true)
	} else {
		config.DB.Create(&models.Notification{UserID: userID, Type: "chat", Title: "Pesan baru", Desc: senderName + ": " + body, Link: "/messages"})
	}
	realtime.Hub.Send(userID, "notify", nil)
}

func Presence(c *gin.Context) {
	var input struct {
		IDs []uint `json:"ids" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || len(input.IDs) > 50 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids wajib (maks 50)"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": realtime.Hub.Online(input.IDs)})
}

func ListNotifications(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var items []models.Notification
	config.DB.Where("user_id = ?", uid).Order("created_at DESC").Limit(50).Find(&items)
	c.JSON(http.StatusOK, gin.H{"data": items})
}

func ReadNotification(c *gin.Context) {
	uid, _ := c.Get("user_id")
	config.DB.Model(&models.Notification{}).Where("id = ? AND user_id = ?", c.Param("id"), uid).Update("read", true)
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

func ReadAllNotifications(c *gin.Context) {
	uid, _ := c.Get("user_id")
	config.DB.Model(&models.Notification{}).Where("user_id = ?", uid).Update("read", true)
	c.JSON(http.StatusOK, gin.H{"message": "ok"})
}

type ContactInput struct {
	Name    string `json:"name" binding:"required"`
	Email   string `json:"email" binding:"required,email"`
	Subject string `json:"subject" binding:"required"`
	Message string `json:"message" binding:"required,min=10"`
}

func SubmitContact(c *gin.Context) {
	var input ContactInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Lengkapi nama, email valid, subjek, dan pesan (min. 10 karakter)"})
		return
	}
	config.DB.Create(&models.ContactMessage{Name: input.Name, Email: input.Email, Subject: input.Subject, Message: input.Message})
	c.JSON(http.StatusCreated, gin.H{"message": "Pesan terkirim, tim kami akan membalas maksimal 3 hari kerja"})
}
