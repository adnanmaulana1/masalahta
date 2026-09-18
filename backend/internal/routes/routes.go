package routes

import (
	"fastwork-backend/internal/handlers"
	"fastwork-backend/internal/middleware"
	"fastwork-backend/internal/realtime"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Authorization", "Content-Type"},
		AllowCredentials: true,
	}))

	api := r.Group("/api")
	{
		api.GET("/health", handlers.Health)
		api.GET("/categories", handlers.ListCategories)
		api.GET("/gigs", handlers.ListGigs)
		api.GET("/gigs/:slug", handlers.GetGig)
		api.GET("/search/suggest", handlers.SearchSuggest)
		api.POST("/contact", handlers.SubmitContact)

		api.POST("/auth/register", handlers.Register)
		api.POST("/auth/login", handlers.Login)
		api.POST("/auth/forgot-password", handlers.ForgotPassword)
		api.POST("/auth/reset-password", handlers.ResetPassword)

		auth := api.Group("")
		auth.Use(middleware.AuthRequired())
		{
			auth.GET("/auth/me", handlers.Me)
			auth.PUT("/auth/me", handlers.UpdateMe)
			auth.POST("/gigs", handlers.CreateGig)
			auth.GET("/my/gigs", handlers.MyGigs)
			auth.DELETE("/gigs/:id", handlers.DeleteGig)

			auth.POST("/orders", handlers.CreateOrder)
			auth.GET("/orders", handlers.ListOrders)
			auth.PUT("/orders/:id/status", handlers.UpdateOrderStatus)
			auth.POST("/reviews", handlers.CreateReview)
			auth.GET("/reviews/mine", handlers.MyReviewedOrders)

			auth.GET("/wishlist", handlers.ListWishlist)
			auth.GET("/wishlist/ids", handlers.WishlistIDs)
			auth.POST("/wishlist/:id", handlers.AddWishlist)
			auth.DELETE("/wishlist/:id", handlers.RemoveWishlist)

		auth.GET("/notifications", handlers.ListNotifications)
		auth.PUT("/notifications/read-all", handlers.ReadAllNotifications)
		auth.PUT("/notifications/:id/read", handlers.ReadNotification)

		auth.GET("/orders/:id/messages", handlers.ListOrderMessages)
		auth.POST("/orders/:id/messages", handlers.SendOrderMessage)
		auth.GET("/conversations", handlers.ListConversations)
		auth.POST("/conversations", handlers.StartConversation)
		auth.GET("/conversations/:id/messages", handlers.ListMessages)
		auth.POST("/conversations/:id/messages", handlers.SendMessage)
		auth.POST("/presence", handlers.Presence)
	}

	r.GET("/ws", realtime.ServeWS)
	}

	r.GET("/", func(c *gin.Context) {
		c.JSON(200, gin.H{"message": "Fastwork API Go + sqlite3", "version": "1.0"})
	})

	return r
}
