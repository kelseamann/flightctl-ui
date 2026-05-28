package mock

import (
	"encoding/json"
	"net/http"

	"github.com/flightctl/flightctl-ui/auth"
	"github.com/flightctl/flightctl-ui/config"
)

// AuthHandler serves standalone login routes without a real Flight Control API.
type AuthHandler struct{}

func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

func (h *AuthHandler) GetUserInfo(w http.ResponseWriter, r *http.Request) {
	if err := auth.EnsureDevSession(w, r); err != nil {
		auth.RespondWithDevError(w, http.StatusInternalServerError, "Failed to set dev session")
		return
	}
	auth.RespondWithDevUserInfo(w, config.DevMockUser)
}

func (h *AuthHandler) Login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		auth.RespondWithDevError(w, http.StatusMethodNotAllowed, "Method not allowed")
		return
	}
	expires := int64(3600)
	tokenData := auth.TokenData{
		Token:    "dev-mock-token",
		Provider: "mock",
	}
	auth.RespondWithDevToken(w, r, tokenData, &expires)
}

func (h *AuthHandler) Refresh(w http.ResponseWriter, r *http.Request) {
	if err := auth.EnsureDevSession(w, r); err != nil {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	expires := int64(3600)
	tokenData := auth.TokenData{
		Token:    "dev-mock-token",
		Provider: "mock",
	}
	auth.RespondWithDevToken(w, r, tokenData, &expires)
}

func (h *AuthHandler) Logout(w http.ResponseWriter, r *http.Request) {
	auth.ClearDevSession(w, r)
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{})
}

func (h *AuthHandler) GetLoginCommand(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string][]any{
		"commands": {},
	})
}
