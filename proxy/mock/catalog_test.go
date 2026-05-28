package mock

import (
	"net/http"
	"path/filepath"
	"testing"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

func TestResolveCatalogFixtures(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	tests := []struct {
		path string
	}{
		{"api/v1/catalogs"},
		{"api/v1/catalogitems"},
		{"api/v1/catalogs/demo-catalog"},
		{"api/v1/catalogs/demo-catalog/items/nginx-demo"},
	}

	for _, tc := range tests {
		body, status, err := store.ResolveFixture(http.MethodGet, tc.path)
		if err != nil || status != http.StatusOK {
			t.Fatalf("%s: status=%d err=%v", tc.path, status, err)
		}
		if len(body) == 0 {
			t.Fatalf("%s: empty body", tc.path)
		}
	}
}
