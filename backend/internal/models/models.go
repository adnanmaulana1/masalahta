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
	Phone         string    `json:"phone"`
	Skills        string    `json:"skills"` // comma-separated
	Website       string    `json:"website"`
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
	PriceType   string    `gorm:"size:20;default:package" json:"price_type"` // package | fixed | custom
	BasePrice   int64     `json:"base_price"`
	Unit        string    `gorm:"size:30" json:"unit"` // per unit, per jam, per kunjungan
	IsCustom    bool      `json:"is_custom"`
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
	User         User      `gorm:"foreignKey:UserID" json:"user"`
	Rating       int       `json:"rating"`
	Comment      string    `json:"comment"`
	CreatedAt    time.Time `json:"created_at"`
}

type PasswordReset struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Token     string    `gorm:"uniqueIndex;size:64" json:"-"`
	ExpiresAt time.Time `json:"expires_at"`
	Used      bool      `json:"-"`
	CreatedAt time.Time `json:"created_at"`
}

type Wishlist struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex:idx_wishlist_user_gig" json:"user_id"`
	GigID     uint      `gorm:"uniqueIndex:idx_wishlist_user_gig" json:"gig_id"`
	Gig       Gig       `gorm:"foreignKey:GigID" json:"gig"`
	CreatedAt time.Time `json:"created_at"`
}

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index" json:"user_id"`
	Type      string    `gorm:"size:20" json:"type"` // order, payment, review, system
	Title     string    `json:"title"`
	Desc      string    `json:"desc"`
	Link      string    `json:"link"`
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"created_at"`
}

type ContactMessage struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	Subject   string    `json:"subject"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}

type Message struct {
	ID             uint      `gorm:"primaryKey" json:"id"`
	OrderID        uint      `json:"order_id"`
	ConversationID uint      `gorm:"index" json:"conversation_id"`
	SenderID       uint      `json:"sender_id"`
	Sender         User      `gorm:"foreignKey:SenderID" json:"sender"`
	Body           string    `json:"body"`
	CreatedAt      time.Time `json:"created_at"`
}

type Conversation struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	ClientID     uint      `gorm:"index" json:"client_id"`
	Client       User      `gorm:"foreignKey:ClientID" json:"client"`
	FreelancerID uint      `gorm:"index" json:"freelancer_id"`
	Freelancer   User      `gorm:"foreignKey:FreelancerID" json:"freelancer"`
	GigID        *uint     `json:"gig_id"`
	Gig          Gig       `gorm:"foreignKey:GigID" json:"gig"`
	OrderID      *uint     `json:"order_id"`
	Order        Order     `gorm:"foreignKey:OrderID" json:"order"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}
