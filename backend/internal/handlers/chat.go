package handlers

import (
	"net/http"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"
	"fastwork-backend/internal/realtime"

	"github.com/gin-gonic/gin"
)

func convoOf(c *gin.Context) (models.Conversation, bool) {
	uid, _ := c.Get("user_id")
	var convo models.Conversation
	if err := config.DB.First(&convo, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Percakapan tidak ditemukan"})
		return convo, false
	}
	if convo.ClientID != uid.(uint) && convo.FreelancerID != uid.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak berhak"})
		return convo, false
	}
	return convo, true
}

func StartConversation(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var input struct {
		GigID uint `json:"gig_id" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "gig_id wajib"})
		return
	}
	var gig models.Gig
	if err := config.DB.First(&gig, input.GigID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jasa tidak ditemukan"})
		return
	}
	if gig.UserID == uid.(uint) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tidak bisa chat dengan diri sendiri"})
		return
	}
	convo := models.Conversation{ClientID: uid.(uint), FreelancerID: gig.UserID, GigID: &gig.ID}
	if err := config.DB.Where("client_id = ? AND freelancer_id = ? AND gig_id = ?", uid, gig.UserID, gig.ID).FirstOrCreate(&convo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal membuka percakapan"})
		return
	}
	config.DB.Preload("Client").Preload("Freelancer").Preload("Gig").First(&convo, convo.ID)
	c.JSON(http.StatusOK, convo)
}

func ListConversations(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var convos []models.Conversation
	config.DB.Preload("Gig").Preload("Order").Preload("Client").Preload("Freelancer").
		Where("client_id = ? OR freelancer_id = ?", uid, uid).Order("updated_at DESC").Find(&convos)
	type convo struct {
		models.Conversation
		LastMessage *models.Message `json:"last_message"`
	}
	out := make([]convo, 0, len(convos))
	for _, o := range convos {
		var last models.Message
		res := config.DB.Preload("Sender").Where("conversation_id = ?", o.ID).Order("created_at DESC").First(&last)
		cv := convo{Conversation: o}
		if res.Error == nil {
			m := last
			cv.LastMessage = &m
		}
		out = append(out, cv)
	}
	// urut: ada pesan terbaru dulu
	for i := 0; i < len(out); i++ {
		for j := i + 1; j < len(out); j++ {
			var ti, tj int64
			if out[i].LastMessage != nil {
				ti = out[i].LastMessage.CreatedAt.Unix()
			}
			if out[j].LastMessage != nil {
				tj = out[j].LastMessage.CreatedAt.Unix()
			}
			if tj > ti {
				out[i], out[j] = out[j], out[i]
			}
		}
	}
	c.JSON(http.StatusOK, gin.H{"data": out})
}

func ListMessages(c *gin.Context) {
	convo, ok := convoOf(c)
	if !ok {
		return
	}
	var msgs []models.Message
	config.DB.Preload("Sender").Where("conversation_id = ?", convo.ID).Order("created_at ASC").Limit(200).Find(&msgs)
	c.JSON(http.StatusOK, gin.H{"data": msgs})
}

func SendMessage(c *gin.Context) {
	uid, _ := c.Get("user_id")
	convo, ok := convoOf(c)
	if !ok {
		return
	}
	var input struct {
		Body string `json:"body" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || len(input.Body) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesan wajib diisi (maks 2000 karakter)"})
		return
	}
	msg := models.Message{ConversationID: convo.ID, SenderID: uid.(uint), Body: input.Body}
	if convo.OrderID != nil {
		msg.OrderID = *convo.OrderID
	}
	config.DB.Create(&msg)
	config.DB.Preload("Sender").First(&msg, msg.ID)
	config.DB.Model(&convo).Update("updated_at", msg.CreatedAt)

	other := convo.ClientID
	if uid.(uint) == convo.ClientID {
		other = convo.FreelancerID
	}
	NotifyChat(other, msg.Sender.FullName, truncate(msg.Body, 80))
	realtime.Hub.Send(other, "chat", msg)
	realtime.Hub.Send(other, "notify", nil)

	c.JSON(http.StatusCreated, msg)
}

// --- kompatibilitas chat per order ---

func convoForOrder(c *gin.Context) (models.Conversation, bool) {
	uid, _ := c.Get("user_id")
	var order models.Order
	if err := config.DB.First(&order, c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order tidak ditemukan"})
		return models.Conversation{}, false
	}
	if order.ClientID != uid.(uint) && order.FreelancerID != uid.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak berhak"})
		return models.Conversation{}, false
	}
	oid := order.ID
	gid := order.GigID
	convo := models.Conversation{ClientID: order.ClientID, FreelancerID: order.FreelancerID, GigID: &gid, OrderID: &oid}
	config.DB.Where("order_id = ?", order.ID).FirstOrCreate(&convo)
	return convo, true
}

func ListOrderMessages(c *gin.Context) {
	convo, ok := convoForOrder(c)
	if !ok {
		return
	}
	var msgs []models.Message
	config.DB.Preload("Sender").Where("conversation_id = ?", convo.ID).Order("created_at ASC").Limit(200).Find(&msgs)
	c.JSON(http.StatusOK, gin.H{"data": msgs, "conversation_id": convo.ID})
}

func SendOrderMessage(c *gin.Context) {
	convo, ok := convoForOrder(c)
	if !ok {
		return
	}
	uid, _ := c.Get("user_id")
	var input struct {
		Body string `json:"body" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil || len(input.Body) > 2000 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Pesan wajib diisi (maks 2000 karakter)"})
		return
	}
	msg := models.Message{ConversationID: convo.ID, SenderID: uid.(uint), Body: input.Body}
	if convo.OrderID != nil {
		msg.OrderID = *convo.OrderID
	}
	config.DB.Create(&msg)
	config.DB.Preload("Sender").First(&msg, msg.ID)
	config.DB.Model(&convo).Update("updated_at", msg.CreatedAt)

	other := convo.ClientID
	if uid.(uint) == convo.ClientID {
		other = convo.FreelancerID
	}
	NotifyChat(other, msg.Sender.FullName, truncate(msg.Body, 80))
	realtime.Hub.Send(other, "chat", msg)
	realtime.Hub.Send(other, "notify", nil)

	c.JSON(http.StatusCreated, msg)
}

func truncate(s string, n int) string {
	r := []rune(s)
	if len(r) <= n {
		return s
	}
	return string(r[:n]) + "…"
}
