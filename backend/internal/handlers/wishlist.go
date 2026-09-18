package handlers

import (
	"net/http"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"

	"github.com/gin-gonic/gin"
)

func ListWishlist(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var items []models.Wishlist
	config.DB.Preload("Gig").Preload("Gig.Category").Preload("Gig.User").Preload("Gig.Packages").
		Where("user_id = ?", uid).Order("created_at DESC").Find(&items)
	gigs := make([]models.Gig, 0, len(items))
	for _, it := range items {
		gigs = append(gigs, it.Gig)
	}
	c.JSON(http.StatusOK, gin.H{"data": gigs})
}

func AddWishlist(c *gin.Context) {
	uid, _ := c.Get("user_id")
	id := c.Param("id")
	var gig models.Gig
	if err := config.DB.First(&gig, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Jasa tidak ditemukan"})
		return
	}
	item := models.Wishlist{UserID: uid.(uint), GigID: gig.ID}
	if err := config.DB.FirstOrCreate(&item, item).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Gagal menyimpan"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "Ditambahkan ke favorit"})
}

func RemoveWishlist(c *gin.Context) {
	uid, _ := c.Get("user_id")
	config.DB.Where("user_id = ? AND gig_id = ?", uid, c.Param("id")).Delete(&models.Wishlist{})
	c.JSON(http.StatusOK, gin.H{"message": "Dihapus dari favorit"})
}

func WishlistIDs(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var ids []uint
	config.DB.Model(&models.Wishlist{}).Where("user_id = ?", uid).Pluck("gig_id", &ids)
	c.JSON(http.StatusOK, gin.H{"data": ids})
}
