package realtime

import (
	"context"
	"encoding/json"
	"net/http"
	"sync"
	"time"

	"fastwork-backend/internal/utils"

	"nhooyr.io/websocket"
	"github.com/gin-gonic/gin"
)

type Envelope struct {
	Type string      `json:"type"` // chat, notify, presence
	Data interface{} `json:"data,omitempty"`
}

type client struct {
	userID uint
	conn   *websocket.Conn
	send   chan []byte
}

var Hub = &hub{clients: map[uint]map[*client]struct{}{}}

type hub struct {
	mu      sync.RWMutex
	clients map[uint]map[*client]struct{}
}

func (h *hub) add(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if h.clients[c.userID] == nil {
		h.clients[c.userID] = map[*client]struct{}{}
	}
	h.clients[c.userID][c] = struct{}{}
}

func (h *hub) remove(c *client) {
	h.mu.Lock()
	defer h.mu.Unlock()
	if set, ok := h.clients[c.userID]; ok {
		delete(set, c)
		if len(set) == 0 {
			delete(h.clients, c.userID)
		}
	}
}

func (h *hub) Send(userID uint, typ string, data interface{}) {
	payload, _ := json.Marshal(Envelope{Type: typ, Data: data})
	h.mu.RLock()
	defer h.mu.RUnlock()
	for c := range h.clients[userID] {
		select {
		case c.send <- payload:
		default:
		}
	}
}

// Online returns IDs of currently connected users.
func (h *hub) Online(ids []uint) map[uint]bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	out := map[uint]bool{}
	for _, id := range ids {
		out[id] = len(h.clients[id]) > 0
	}
	return out
}

func ServeWS(c *gin.Context) {
	token := c.Query("token")
	if token == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "token required"})
		return
	}
	claims, err := utils.ParseToken(token)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
		return
	}
	conn, err := websocket.Accept(c.Writer, c.Request, &websocket.AcceptOptions{OriginPatterns: []string{"*"}})
	if err != nil {
		return
	}
	cl := &client{userID: claims.UserID, conn: conn, send: make(chan []byte, 32)}
	Hub.add(cl)
	defer Hub.remove(cl)

	ctx, cancel := context.WithCancel(c.Request.Context())
	defer cancel()

	go func() {
		for msg := range cl.send {
			wctx, wcancel := context.WithTimeout(ctx, 10*time.Second)
			err := conn.Write(wctx, websocket.MessageText, msg)
			wcancel()
			if err != nil {
				return
			}
		}
	}()

	// read loop: keepalive + relay typing indicator
	for {
		rctx, rcancel := context.WithTimeout(ctx, 60*time.Second)
		_, payload, err := conn.Read(rctx)
		rcancel()
		if err != nil {
			status := websocket.CloseStatus(err)
			if status == websocket.StatusNormalClosure || status == websocket.StatusGoingAway {
				conn.Close(websocket.StatusNormalClosure, "")
			}
			return
		}
		var incoming struct {
			Type           string `json:"type"`
			To             uint   `json:"to"`
			ConversationID uint   `json:"conversation_id"`
		}
		if err := json.Unmarshal(payload, &incoming); err != nil {
			continue
		}
		if incoming.Type == "typing" && incoming.To != 0 {
			Hub.Send(incoming.To, "typing", map[string]interface{}{"from": cl.userID, "conversation_id": incoming.ConversationID})
		}
	}
}
