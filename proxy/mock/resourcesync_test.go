package mock

import (
	"net/http"
	"path/filepath"
	"strings"
	"testing"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

func TestResolveResourceSyncDetailFixtures(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	tests := []string{
		"api/v1/resourcesyncs/rs-pending-fleet",
		"api/v1/resourcesyncs/rs-error-fleet",
	}

	for _, path := range tests {
		body, status, err := store.ResolveFixture(http.MethodGet, path)
		if err != nil || status != http.StatusOK {
			t.Fatalf("%s: status=%d err=%v", path, status, err)
		}
		if len(body) == 0 {
			t.Fatalf("%s: empty body", path)
		}
	}

	fleetListBody, status, err := store.ResolveFixture(http.MethodGet, "api/v1/resourcesyncs?fieldSelector=spec.type!=catalog")
	if err != nil || status != http.StatusOK {
		t.Fatalf("fleet fieldSelector: status=%d err=%v", status, err)
	}
	if !strings.Contains(string(fleetListBody), "rs-pending-fleet") {
		t.Fatalf("fleet fieldSelector: expected rs-pending-fleet in response")
	}

	catalogListBody, status, err := store.ResolveFixture(http.MethodGet, "api/v1/resourcesyncs?fieldSelector=spec.type==catalog")
	if err != nil || status != http.StatusOK {
		t.Fatalf("catalog fieldSelector: status=%d err=%v", status, err)
	}
	if strings.Contains(string(catalogListBody), "rs-pending-fleet") {
		t.Fatalf("catalog fieldSelector: did not expect rs-pending-fleet in response")
	}
}
