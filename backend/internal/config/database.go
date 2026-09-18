package config

import (
	"log"

	"fastwork-backend/internal/models"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func ConnectDatabase() {
	var err error
	DB, err = gorm.Open(sqlite.Open("fastwork.db"), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err != nil {
		log.Fatal("Failed to connect database:", err)
	}

	err = DB.AutoMigrate(
		&models.User{},
		&models.Category{},
		&models.Gig{},
		&models.Package{},
		&models.Order{},
		&models.Review{},
		&models.PasswordReset{},
		&models.Wishlist{},
		&models.Notification{},
		&models.ContactMessage{},
		&models.Message{},
		&models.Conversation{},
	)
	if err != nil {
		log.Fatal("Failed to migrate:", err)
	}

	backfillConversations()

	SeedData()
}

func backfillConversations() {
	var msgs []models.Message
	DB.Where("conversation_id = ? AND order_id <> ?", 0, 0).Find(&msgs)
	byOrder := map[uint][]models.Message{}
	for _, m := range msgs {
		byOrder[m.OrderID] = append(byOrder[m.OrderID], m)
	}
	for orderID := range byOrder {
		var order models.Order
		if err := DB.First(&order, orderID).Error; err != nil {
			continue
		}
		convo := models.Conversation{ClientID: order.ClientID, FreelancerID: order.FreelancerID, GigID: &order.GigID, OrderID: &order.ID}
		oid := order.ID
		gid := order.GigID
		convo.OrderID = &oid
		convo.GigID = &gid
		if err := DB.Where("order_id = ?", orderID).FirstOrCreate(&convo).Error; err != nil {
			continue
		}
		DB.Model(&models.Message{}).Where("order_id = ? AND conversation_id = ?", orderID, 0).Update("conversation_id", convo.ID)
	}
}

func SeedData() {
	var count int64
	DB.Model(&models.Category{}).Count(&count)
	if count > 0 {
		return
	}

	categories := []models.Category{
		{Name: "Desain Grafis", Slug: "desain-grafis", Icon: "🎨"},
		{Name: "Website & IT", Slug: "website-it", Icon: "💻"},
		{Name: "Video & Animasi", Slug: "video-animasi", Icon: "🎬"},
		{Name: "Penulisan", Slug: "penulisan", Icon: "✍️"},
		{Name: "Digital Marketing", Slug: "digital-marketing", Icon: "📈"},
		{Name: "Fotografi", Slug: "fotografi", Icon: "📸"},
		{Name: "Musik & Audio", Slug: "musik-audio", Icon: "🎵"},
		{Name: "Bisnis", Slug: "bisnis", Icon: "💼"},
		{Name: "Service AC", Slug: "service-ac", Icon: "❄️"},
	}
	for _, c := range categories {
		DB.Create(&c)
	}

	// seed users
	// password: password123 -> hash $2a$10$8qwAe8MVLBy2Ouazx.0tK.YMSPdwn14q4cI.acIQ2VOn7rrX8oSL6
	DB.Create(&models.User{Username: "dian_design", Email: "dian@example.com", Password: "$2a$10$8qwAe8MVLBy2Ouazx.0tK.YMSPdwn14q4cI.acIQ2VOn7rrX8oSL6", Role: "freelancer", FullName: "Dian Sastro", Avatar: "https://i.pravatar.cc/150?img=5", Location: "Jakarta", Bio: "Desainer Grafis 5+ tahun, especialista logo & branding", Rating: 4.9, ReviewCount: 127, CompletedJobs: 210})
	DB.Create(&models.User{Username: "budi_coder", Email: "budi@example.com", Password: "$2a$10$8qwAe8MVLBy2Ouazx.0tK.YMSPdwn14q4cI.acIQ2VOn7rrX8oSL6", Role: "freelancer", FullName: "Budi Santoso", Avatar: "https://i.pravatar.cc/150?img=12", Location: "Bandung", Bio: "Fullstack Developer React & Go", Rating: 4.8, ReviewCount: 89, CompletedJobs: 156})
	DB.Create(&models.User{Username: "client_andi", Email: "andi@example.com", Password: "$2a$10$8qwAe8MVLBy2Ouazx.0tK.YMSPdwn14q4cI.acIQ2VOn7rrX8oSL6", Role: "client", FullName: "Andi Wijaya", Avatar: "https://i.pravatar.cc/150?img=8", Location: "Surabaya", Bio: "Owner UMKM"})

	var dian, budi models.User
	DB.Where("username = ?", "dian_design").First(&dian)
	DB.Where("username = ?", "budi_coder").First(&budi)

	var catDesign, catIT, catAC models.Category
	DB.Where("slug = ?", "desain-grafis").First(&catDesign)
	DB.Where("slug = ?", "website-it").First(&catIT)
	DB.Where("slug = ?", "service-ac").First(&catAC)

	gigs := []models.Gig{
		{
			Title: "Jasa Desain Logo Premium Modern Minimalis 3 Konsep + Revisi Unlimited",
			Slug: "desain-logo-premium-modern",
			Description: "Dapatkan logo profesional untuk brand Anda. 3 konsep awal, revisi unlimited, file master AI/EPS/PNG/JPG. Proses cepat 2 hari, sudah termasuk brand guideline sederhana.",
			Images: `["https://images.unsplash.com/photo-1634942537034-2531766767d1?w=600","https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=600"]`,
			CategoryID: catDesign.ID, UserID: dian.ID, Rating: 4.9, ReviewCount: 87, ViewCount: 3420, IsActive: true,
		},
		{
			Title: "Pembuatan Website Company Profile WordPress + SEO + Gratis Domain Hosting",
			Slug: "website-company-profile-wordpress",
			Description: "Website profesional responsive, SEO optimized, include hosting 1 tahun, SSL, maintenance 3 bulan. Cocok untuk UMKM, startup, perusahaan.",
			Images: `["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600","https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600"]`,
			CategoryID: catIT.ID, UserID: budi.ID, Rating: 4.8, ReviewCount: 54, ViewCount: 2103, IsActive: true,
		},
		{
			Title: "Desain Feed Instagram Estetik 30 Post + Story Template Canva",
			Slug: "desain-feed-instagram-estetik",
			Description: "Feed Instagram rapi & estetik, 30 desain feed + 10 story, bonus template Canva editable. Niche bebas: beauty, fashion, kuliner, dll.",
			Images: `["https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=600"]`,
			CategoryID: catDesign.ID, UserID: dian.ID, Rating: 4.9, ReviewCount: 112, ViewCount: 4890, IsActive: true,
		},
		{
			Title: "Jasa Pembuatan Aplikasi Mobile Flutter iOS & Android",
			Slug: "aplikasi-mobile-flutter",
			Description: "Aplikasi mobile cross-platform Flutter, clean code, integrasi API, publish Play Store & App Store dibantu sampai live.",
			Images: `["https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=600","https://images.unsplash.com/photo-1518770660439-4636190af475?w=600"]`,
			CategoryID: catIT.ID, UserID: budi.ID, Rating: 5.0, ReviewCount: 23, ViewCount: 1204, IsActive: true,
		},
		{
			Title: "Jasa Cuci AC Split 0.5 - 2 PK Bergaransi Bersih Maksimal",
			Slug: "cuci-ac-split-bergaransi",
			Description: "Cuci AC menyeluruh indoor & outdoor, semprot evaporator, cek freon & ampere, garansi 7 hari tidak dingin. Teknisi bersertifikat, area Jabodetabek. Gratis cek kebocoran.",
			Images: `["https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600","https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600"]`,
			CategoryID: catAC.ID, UserID: budi.ID, Rating: 4.9, ReviewCount: 234, ViewCount: 5120, IsActive: true,
		},
		{
			Title: "Service AC + Isi Freon R32/R410 Lengkap + Cek Kebocoran",
			Slug: "service-ac-isi-freon-r32",
			Description: "Service AC tidak dingin? Isi freon R32/R410 original, vakum, pressure test, isi sesuai gramasi pabrik. Termasuk cuci filter & cleaning ringan.",
			Images: `["https://images.unsplash.com/photo-1617469767053-d3b523a0b982?w=600"]`,
			CategoryID: catAC.ID, UserID: budi.ID, Rating: 4.8, ReviewCount: 98, ViewCount: 3210, IsActive: true,
		},
		{
			Title: "Bongkar Pasang AC Split + Instalasi Pipa & Vakum Bergaransi 30 Hari",
			Slug: "bongkar-pasang-ac-split",
			Description: "Bongkar pasang AC pindahan kost/kantor/rumah. Instalasi pipa AC, braket, vakum, test running. Garansi instalasi 30 hari. Harga sudah termasuk freon awal.",
			Images: `["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600"]`,
			CategoryID: catAC.ID, UserID: budi.ID, Rating: 5.0, ReviewCount: 67, ViewCount: 1890, IsActive: true,
		},
	}
	for i := range gigs {
		DB.Create(&gigs[i])
		// create packages - custom for Service AC
		var packages []models.Package
		if gigs[i].CategoryID == catAC.ID {
			packages = []models.Package{
				{GigID: gigs[i].ID, Name: "Basic", Description: "Cuci saja", Price: 75000, DeliveryDays: 1, Revisions: 1, Features: `["Cuci indoor+outdoor","Cek freon","Garansi 7 hari"]`},
				{GigID: gigs[i].ID, Name: "Standard", Description: "Paling laris", Price: 150000, DeliveryDays: 1, Revisions: 2, Features: `["Cuci lengkap","Isi freon 1/2 PK","Vakum & test","Garansi 14 hari"]`},
				{GigID: gigs[i].ID, Name: "Premium", Description: "Full service", Price: 285000, DeliveryDays: 1, Revisions: 3, Features: `["Bongkar pasang","Pipa 3m","Vakum","Isi freon full","Garansi 30 hari"]`},
			}
		} else {
			packages = []models.Package{
				{GigID: gigs[i].ID, Name: "Basic", Description: "Paket hemat, cocok untuk kebutuhan dasar", Price: int64(150000 + i*50000), DeliveryDays: 3, Revisions: 2, Features: `["1 Konsep","2 Revisi","File JPG/PNG"]`},
				{GigID: gigs[i].ID, Name: "Standard", Description: "Paling populer, fitur lengkap", Price: int64(350000 + i*50000), DeliveryDays: 2, Revisions: 5, Features: `["3 Konsep","5 Revisi","File Master AI/EPS","Support Prioritas"]`},
				{GigID: gigs[i].ID, Name: "Premium", Description: "All in, terbaik untuk brand besar", Price: int64(750000 + i*100000), DeliveryDays: 1, Revisions: 10, Features: `["5 Konsep","Unlimited Revisi","Brand Guideline","Mockup 3D","Konsultasi 1 Jam"]`},
			}
		}
		for _, p := range packages {
			DB.Create(&p)
		}
	}

	log.Println("✅ Database seeded")
}
