package handlers

import (
	"net/http"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateOrderInput struct {
	GigID     uint   `json:"gig_id" binding:"required"`
	PackageID *uint  `json:"package_id"`
	Note      string `json:"note"`
}

func CreateOrder(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var input CreateOrderInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var gig models.Gig
	if err := config.DB.First(&gig, input.GigID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gig tidak ditemukan"})
		return
	}
	var pkg models.Package
	var price int64
	var pkgID uint
	if gig.PriceType == "package" || gig.PriceType == "" {
		if input.PackageID == nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Paket wajib dipilih"})
			return
		}
		if err := config.DB.First(&pkg, *input.PackageID).Error; err != nil {
			c.JSON(http.StatusNotFound, gin.H{"error": "Paket tidak ditemukan"})
			return
		}
		price = pkg.Price
		pkgID = pkg.ID
	} else {
		if input.PackageID != nil {
			_ = config.DB.First(&pkg, *input.PackageID).Error
			if pkg.ID != 0 {
				price = pkg.Price
				pkgID = pkg.ID
			} else {
				price = gig.BasePrice
			}
		} else {
			price = gig.BasePrice
		}
		if gig.IsCustom {
			price = 0
		}
	}
	order := models.Order{
		GigID: gig.ID, PackageID: pkgID, ClientID: uid.(uint), FreelancerID: gig.UserID,
		Price: price, Status: "pending", Note: input.Note,
	}
	config.DB.Create(&order)
	config.DB.Preload("Gig").Preload("Package").Preload("Client").Preload("Freelancer").First(&order, order.ID)
	oid := order.ID
	gid := order.GigID
	config.DB.Where("order_id = ?", order.ID).FirstOrCreate(&models.Conversation{ClientID: order.ClientID, FreelancerID: order.FreelancerID, GigID: &gid, OrderID: &oid})
	Notify(gig.UserID, "order", "Pesanan baru diterima", order.Client.FullName+" memesan "+gig.Title, "/orders")
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
	other := order.ClientID
	if uid.(uint) == order.ClientID {
		other = order.FreelancerID
	}
	Notify(other, "order", "Status pesanan: "+input.Status, "Pesanan #"+c.Param("id")+" berubah menjadi "+input.Status, "/orders")
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
	var order models.Order
	if err := config.DB.First(&order, input.OrderID).Error; err != nil || order.ClientID != uid.(uint) {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya pembeli order ini yang bisa mengulas"})
		return
	}
	if order.Status != "completed" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Ulasan hanya untuk order selesai"})
		return
	}
	review := models.Review{GigID: input.GigID, OrderID: input.OrderID, UserID: uid.(uint), Rating: input.Rating, Comment: input.Comment}
	var exists int64
	config.DB.Model(&models.Review{}).Where("order_id = ? AND user_id = ?", input.OrderID, uid).Count(&exists)
	if exists > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Order ini sudah diulas"})
		return
	}
	if input.Rating < 1 || input.Rating > 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Rating 1–5"})
		return
	}
	config.DB.Create(&review)
	// update gig rating naive
	var gig models.Gig
	config.DB.First(&gig, input.GigID)
	newCount := gig.ReviewCount + 1
	newRating := (gig.Rating*float64(gig.ReviewCount) + float64(input.Rating)) / float64(newCount)
	config.DB.Model(&gig).Updates(map[string]interface{}{"rating": newRating, "review_count": newCount})
	Notify(gig.UserID, "review", "Ulasan baru bintang "+string(rune('0'+input.Rating)), input.Comment, "/dashboard?tab=gigs")
	c.JSON(http.StatusCreated, review)
}

func MyReviewedOrders(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var ids []uint
	config.DB.Model(&models.Review{}).Where("user_id = ?", uid).Pluck("order_id", &ids)
	c.JSON(http.StatusOK, gin.H{"data": ids})
}
