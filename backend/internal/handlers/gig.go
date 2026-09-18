package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func ListGigs(c *gin.Context) {
	var gigs []models.Gig
	query := config.DB.Preload("User").Preload("Category").Preload("Packages").Where("is_active = ?", true)

	if q := c.Query("q"); q != "" {
		query = query.Where("title LIKE ?", "%"+q+"%")
	}
	if cat := c.Query("category"); cat != "" {
		var category models.Category
		if err := config.DB.Where("slug = ?", cat).First(&category).Error; err == nil {
			query = query.Where("category_id = ?", category.ID)
		}
	}
	if sort := c.Query("sort"); sort == "terlaris" {
		query = query.Order("view_count DESC")
	} else if sort == "rating" {
		query = query.Order("rating DESC")
	} else {
		query = query.Order("created_at DESC")
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))
	offset := (page - 1) * limit

	var total int64
	query.Model(&models.Gig{}).Count(&total)
	query.Offset(offset).Limit(limit).Find(&gigs)

	c.JSON(http.StatusOK, gin.H{"data": gigs, "total": total, "page": page, "limit": limit})
}

func GetGig(c *gin.Context) {
	slug := c.Param("slug")
	var gig models.Gig
	if err := config.DB.Preload("User").Preload("Category").Preload("Packages").Where("slug = ?", slug).First(&gig).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gig tidak ditemukan"})
		return
	}
	// increment view
	config.DB.Model(&gig).UpdateColumn("view_count", gig.ViewCount+1)

	// get reviews
	var reviews []models.Review
	config.DB.Preload("User").Where("gig_id = ?", gig.ID).Order("created_at DESC").Limit(10).Find(&reviews)

	// try parse images
	var images []string
	json.Unmarshal([]byte(gig.Images), &images)

	c.JSON(http.StatusOK, gin.H{"gig": gig, "images": images, "reviews": reviews})
}

type CreateGigInput struct {
	Title       string `json:"title" binding:"required"`
	Description string `json:"description" binding:"required"`
	CategoryID  uint   `json:"category_id" binding:"required"`
	Images      []string `json:"images"`
	Packages    []struct {
		Name         string   `json:"name"`
		Description  string   `json:"description"`
		Price        int64    `json:"price"`
		DeliveryDays int      `json:"delivery_days"`
		Revisions    int      `json:"revisions"`
		Features     []string `json:"features"`
	} `json:"packages"`
}

func CreateGig(c *gin.Context) {
	uid, _ := c.Get("user_id")
	if role, _ := c.Get("role"); role != "freelancer" {
		c.JSON(http.StatusForbidden, gin.H{"error": "Hanya freelancer yang bisa menjual jasa"})
		return
	}
	var input CreateGigInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	imagesJSON, _ := json.Marshal(input.Images)
	if len(imagesJSON) == 0 || string(imagesJSON) == "null" {
		imagesJSON = []byte(`["https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600"]`)
	}
	slug := strings.ToLower(strings.ReplaceAll(input.Title, " ", "-"))
	slug = strings.ReplaceAll(slug, "/", "-")
	slug = slug + "-" + uuid.New().String()[:6]

	gig := models.Gig{
		Title:       input.Title,
		Slug:        slug,
		Description: input.Description,
		Images:      string(imagesJSON),
		CategoryID:  input.CategoryID,
		UserID:      uid.(uint),
		Rating:      5.0,
		IsActive:    true,
	}
	if err := config.DB.Create(&gig).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	for _, p := range input.Packages {
		feat, _ := json.Marshal(p.Features)
		pkg := models.Package{
			GigID: gig.ID, Name: p.Name, Description: p.Description, Price: p.Price, DeliveryDays: p.DeliveryDays, Revisions: p.Revisions, Features: string(feat),
		}
		config.DB.Create(&pkg)
	}
	config.DB.Preload("Packages").Preload("Category").Preload("User").First(&gig, gig.ID)
	c.JSON(http.StatusCreated, gig)
}

func MyGigs(c *gin.Context) {
	uid, _ := c.Get("user_id")
	var gigs []models.Gig
	config.DB.Preload("Category").Preload("Packages").Where("user_id = ?", uid).Order("created_at DESC").Find(&gigs)
	c.JSON(http.StatusOK, gin.H{"data": gigs})
}

func DeleteGig(c *gin.Context) {
	uid, _ := c.Get("user_id")
	id := c.Param("id")
	var gig models.Gig
	if err := config.DB.Where("id = ? AND user_id = ?", id, uid).First(&gig).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Gig tidak ditemukan atau bukan milik Anda"})
		return
	}
	config.DB.Delete(&gig)
	c.JSON(http.StatusOK, gin.H{"message": "Gig dihapus"})
}

func ListCategories(c *gin.Context) {
	var cats []models.Category
	config.DB.Find(&cats)
	c.JSON(http.StatusOK, gin.H{"data": cats})
}

func SearchSuggest(c *gin.Context) {
	q := c.Query("q")
	if q == "" {
		c.JSON(http.StatusOK, gin.H{"data": []string{}})
		return
	}
	var gigs []models.Gig
	config.DB.Select("title").Where("title LIKE ?", "%"+q+"%").Limit(5).Find(&gigs)
	var titles []string
	for _, g := range gigs {
		titles = append(titles, g.Title)
	}
	c.JSON(http.StatusOK, gin.H{"data": titles})
}

func Health(c *gin.Context) {
	fmt.Println("health check")
	c.JSON(http.StatusOK, gin.H{"status": "ok", "db": "sqlite3"})
}
