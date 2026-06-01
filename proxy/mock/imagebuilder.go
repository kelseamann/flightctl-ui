package mock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

// ImageBuilderHandler serves static JSON fixtures for /api/imagebuilder/{forward:.*}.
type ImageBuilderHandler struct {
	store *Store
}

func NewImageBuilderHandler(store *Store) *ImageBuilderHandler {
	return &ImageBuilderHandler{store: store}
}

func (h *ImageBuilderHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	forward := mux.Vars(r)["forward"]
	result := h.store.ResolveImageBuilder(r.Method, forward)
	if result.Err != nil {
		if result.Status == http.StatusNotFound {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusNotFound)
			_ = json.NewEncoder(w).Encode(map[string]string{
				"message": "mock: " + result.Err.Error(),
			})
			return
		}
		if result.Status == http.StatusMethodNotAllowed {
			http.Error(w, result.Err.Error(), result.Status)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(result.Status)
		_ = json.NewEncoder(w).Encode(map[string]string{
			"message": result.Err.Error(),
		})
		return
	}

	contentType := result.ContentType
	if contentType == "" {
		contentType = "application/json"
	}
	w.Header().Set("Content-Type", contentType)
	w.WriteHeader(result.Status)

	if result.ContentType == "text/event-stream" {
		writeSSELogLines(w, result.Body)
		return
	}

	_, _ = w.Write(result.Body)
}

func writeSSELogLines(w http.ResponseWriter, body []byte) {
	flusher, ok := w.(http.Flusher)
	if !ok {
		_, _ = w.Write(body)
		return
	}

	for _, line := range strings.Split(string(body), "\n") {
		if line == "" {
			continue
		}
		_, _ = fmt.Fprintf(w, "data: %s\n\n", line)
		flusher.Flush()
	}
}
