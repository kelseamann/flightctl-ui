package mock

import (
	"net/http"
	"path/filepath"
	"testing"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

func TestResolveDeviceFixtures(t *testing.T) {
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
		{"api/v1/devices"},
		{"api/v1/devices/device-east-001"},
		{"api/v1/devices/device-west-001"},
		{"api/v1/devices/device-east-001/lastseen"},
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

	_, status, err := store.ResolveFixture(http.MethodGet, "api/v1/devices/unknown-device/lastseen")
	if err == nil || status != http.StatusNotFound {
		t.Fatalf("unknown device lastseen: status=%d err=%v", status, err)
	}
}
