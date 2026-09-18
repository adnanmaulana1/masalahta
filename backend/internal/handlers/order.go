package handlers

import (
	"net/http"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateOrderInput struct {
	GigID     uint   `json:"gig_id" binding:"required"`
	PackageID uint   `json:"package_id" binding:"required"`
	Note      string `json:"note"`
}

func CreateOrder(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var pkg models.Package
	if err := config.DB.First(&pkg, input.PackageID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Paket tidak ditemukan"})
		return
	}
	var gig models.Gig
	if err := config.DB.First(&gig, input.GigID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gig tidak ditemukan"})
		return
	}
	order := models.Order{
		GigID: gig.ID, PackageID: pkg.ID, ClientID: uid.(uint), FreelancerID: gig.UserID,
		Price: pkg.Price, Status: "pending", Note: input.Note,
	}
	config.DB.Create(&order)
	config.DB.Preload("Gig").Preload("Package").Preload("Client").Preload("Freelancer").First(&order, order.ID)
	c.JSON(http.StatusCreated, order)
}

func ListOrders(c *gin.Context) {
	uid, _ := c.Get("user_id")
	role, _ := c.Get("role")
	var orders []models.Order
	query := config.DB.Preload("Gig").Preload("Package").Preload("Client").Preload("Freelancer")
	if role == "freelancer" {
		query = query.Where("freelancer_id = ?", uid)
	} else {
		query = query.Where("client_id = ?", uid)
	}
	query.Order("created_at DESC").Find(&orders)
	c.JSON(http.StatusOK, gin.H{"data": orders})
}

func UpdateOrderStatus(c *gin.Context) {
	uid, _ := c.Get("user_id")
	id := c.Param("id")
	var input struct {
		Status string `json:"status" binding:"required"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var order models.Order
	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order tidak ditemukan"})
		return
	}
	// only freelancer or client can update if related
	if order.ClientID != uid.(uint) && order.FreelancerID != uid.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Tidak berhak"})
		return
	}
	order.Status = input.Status
	config.DB.Save(&order)
	c.JSON(http.StatusOK, order)
}

func CreateReview(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var input struct {
		GigID   uint   `json:"gig_id" binding:"required"`
		OrderID uint   `json:"order_id" binding:"required"`
		Rating  int    `json:"rating" binding:"required"`
		Comment string `json:"comment"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	review := models.Review{GigID: input.GigID, OrderID: input.OrderID, UserID: uid.(uint), Rating: input.Rating, Comment: input.Comment}
	config.DB.Create(&review)
	// update gig rating naive
	var gig models.Gig
	config.DB.First(&gig, input.GigID)
	newCount := gig.ReviewCount + 1
	newRating := (gig.Rating*float64(gig.ReviewCount) + float64(input.Rating)) / float64(newCount)
	config.DB.Model(&gig).Updates(map[string]interface{}{"rating": newRating, "review_count": newCount})
	c.JSON(http.StatusCreated, review)
}
