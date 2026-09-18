package models

import (
	"time"
)

type User struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	Username      string    `gorm:"uniqueIndex;size:50" json:"username"`
	Email         string    `gorm:"uniqueIndex" json:"email"`
	Password      string    `json:"-"`
	FullName      string    `json:"full_name"`
	Avatar        string    `json:"avatar"`
	Role          string    `gorm:"size:20;default:client" json:"role"` // freelancer, client, admin
	Location      string    `json:"location"`
	Bio           string    `json:"bio"`
	Rating        float64   `json:"rating"`
	ReviewCount   int       `json:"review_count"`
	CompletedJobs int       `json:"completed_jobs"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type Category struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Slug      string    `gorm:"uniqueIndex" json:"slug"`
	Icon      string    `json:"icon"`
	CreatedAt time.Time `json:"created_at"`
}

type Gig struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Title       string    `json:"title"`
	Slug        string    `gorm:"uniqueIndex" json:"slug"`
	Description string    `json:"description"`
	Images      string    `json:"images"` // JSON array string
	CategoryID  uint      `json:"category_id"`
	Category    Category  `gorm:"foreignKey:CategoryID" json:"category"`
	UserID      uint      `json:"user_id"`
	User        User      `gorm:"foreignKey:UserID" json:"user"`
	Packages    []Package `json:"packages"`
	Rating      float64   `json:"rating"`
	ReviewCount int       `json:"review_count"`
	ViewCount   int       `json:"view_count"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Package struct {
	ID           uint   `gorm:"primaryKey" json:"id"`
	GigID        uint   `json:"gig_id"`
	Name         string `json:"name"` // Basic, Standard, Premium
	Description  string `json:"description"`
	Price        int64  `json:"price"`
	DeliveryDays int    `json:"delivery_days"`
	Revisions    int    `json:"revisions"`
	Features     string `json:"features"` // JSON array
}

type Order struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	GigID       uint      `json:"gig_id"`
	Gig         Gig       `gorm:"foreignKey:GigID" json:"gig"`
	PackageID   uint      `json:"package_id"`
	Package     Package   `gorm:"foreignKey:PackageID" json:"package"`
	ClientID    uint      `json:"client_id"`
	Client      User      `gorm:"foreignKey:ClientID" json:"client"`
	FreelancerID uint     `json:"freelancer_id"`
	Freelancer  User      `gorm:"foreignKey:FreelancerID" json:"freelancer"`
	Price       int64     `json:"price"`
	Status      string    `json:"status"` // pending, progress, review, completed, cancelled
	Note        string    `json:"note"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

type Review struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	GigID        uint      `json:"gig_id"`
	OrderID      uint      `json:"order_id"`
	UserID       uint      `json:"user_id"`
	User         User      `json:"user"`
	Rating       int       `json:"rating"`
	Comment      string    `json:"comment"`
	CreatedAt    time.Time `json:"created_at"`
}
