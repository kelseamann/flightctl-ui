package auth

import (
	"encoding/json"
	"net/http"
)

// EnsureDevSession sets a mock session cookie when none is present (DEV_MOCK_API only).
func EnsureDevSession(w http.ResponseWriter, r *http.Request) error {
	tokenData, err := ParseSessionCookie(r)
	if err != nil {
		return err
	}
	if tokenData.Token != "" {
		return nil
	}
	return setCookie(w, r, TokenData{
		Token:    "dev-mock-token",
		Provider: "mock",
	})
}

// RespondWithDevUserInfo writes a login/info JSON body for dev mock mode.
func RespondWithDevUserInfo(w http.ResponseWriter, username string) {
	userInfo := UserInfoResponse{Username: username}
	res, err := json.Marshal(userInfo)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(res)
}

// RespondWithDevToken sets the session cookie and returns expiresIn JSON.
func RespondWithDevToken(w http.ResponseWriter, r *http.Request, tokenData TokenData, expires *int64) {
	respondWithToken(w, r, tokenData, expires)
}

// RespondWithDevError writes a JSON error for dev mock login routes.
func RespondWithDevError(w http.ResponseWriter, statusCode int, message string) {
	respondWithError(w, statusCode, message)
}

// ClearDevSession removes the session cookie (dev mock logout).
func ClearDevSession(w http.ResponseWriter, r *http.Request) {
	clearSessionCookie(w, r)
}
