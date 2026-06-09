package mock

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"testing"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

func TestResolveFixture(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	tests := []struct {
		method string
		path   string
		file   string
	}{
		{http.MethodGet, "api/v1/fleets", "flightctl/fleets.list.json"},
		{http.MethodGet, "api/v1/organizations", "flightctl/organizations.list.json"},
		{http.MethodGet, "api/v1/auth/permissions", "auth/permissions.json"},
		{http.MethodGet, "api/v1/fleets/eu-east-prod-001", ""},
	}

	for _, tc := range tests {
		body, status, err := store.ResolveFixture(tc.method, tc.path)
		if err != nil || status != http.StatusOK {
			t.Fatalf("%s %s: status=%d err=%v", tc.method, tc.path, status, err)
		}
		if len(body) == 0 {
			t.Fatalf("%s %s: empty body", tc.method, tc.path)
		}
		if tc.file != "" {
			expected, err := os.ReadFile(filepath.Join(root, tc.file))
			if err != nil {
				t.Fatalf("read expected: %v", err)
			}
			if string(body) != string(expected) {
				t.Fatalf("%s %s: body mismatch with %s", tc.method, tc.path, tc.file)
			}
		}
	}
}

func TestResolveFixtureNotFound(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	_, status, err := store.ResolveFixture(http.MethodGet, "api/v1/unknown-resource")
	if err == nil || status != http.StatusNotFound {
		t.Fatalf("expected 404, got status=%d err=%v", status, err)
	}
}

func TestEnrollmentRequestsMergePreservesMetadata(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	_, status, err := store.ResolveFixture(http.MethodPost, "api/v1/enrollmentrequests")
	if err != nil || status != http.StatusCreated {
		t.Fatalf("POST enrollmentrequests: status=%d err=%v", status, err)
	}

	body, status, err := store.ResolveFixture(http.MethodGet, "api/v1/enrollmentrequests")
	if err != nil || status != http.StatusOK {
		t.Fatalf("GET enrollmentrequests: status=%d err=%v", status, err)
	}

	var parsed struct {
		Metadata map[string]interface{} `json:"metadata"`
		Items    []json.RawMessage      `json:"items"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if parsed.Metadata == nil {
		t.Fatalf("merged enrollment list missing metadata")
	}
	if len(parsed.Items) < 4 {
		t.Fatalf("expected at least 4 enrollment items, got %d", len(parsed.Items))
	}
}
