package main

import (
	"log"
	"os"

	"fastwork-backend/internal/config"
	"fastwork-backend/internal/routes"
)

func main() {
	config.ConnectDatabase()

	r := routes.SetupRouter()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("🚀 Fastwork backend running on http://localhost:%s (sqlite3: fastwork.db)", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}
