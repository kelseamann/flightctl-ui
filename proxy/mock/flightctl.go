package mock

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
)

// FlightCtlHandler serves static JSON fixtures for /api/flightctl/{forward:.*}.
type FlightCtlHandler struct {
	store *Store
}

func NewFlightCtlHandler(store *Store) *FlightCtlHandler {
	return &FlightCtlHandler{store: store}
}

func (h *FlightCtlHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	forward := mux.Vars(r)["forward"]
	body, status, err := h.store.ResolveFixture(r.Method, forward)
	if err != nil {
		if status == http.StatusNotFound {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"message": "mock: " + err.Error(),
			})
			return
		}
		if status == http.StatusMethodNotAllowed {
			http.Error(w, err.Error(), status)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(status)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message": err.Error(),
		})
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_, _ = w.Write(body)
}
