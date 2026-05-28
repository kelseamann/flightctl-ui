package mock

import (
	"net/http"
	"os"
	"path/filepath"
	"testing"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

func TestResolveImageBuilderFixture(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	body, status, err := store.ResolveImageBuilderFixture(http.MethodGet, "api/v1/imagebuilds")
	if err != nil || status != http.StatusOK {
		t.Fatalf("imagebuilds list: status=%d err=%v", status, err)
	}

	expected, err := os.ReadFile(filepath.Join(root, "imagebuilder", "imagebuilds.list.json"))
	if err != nil {
		t.Fatalf("read expected: %v", err)
	}
	if string(body) != string(expected) {
		t.Fatalf("imagebuilds list body mismatch")
	}

	_, status, err = store.ResolveImageBuilderFixture(http.MethodGet, "api/v1/imagebuilds/demo-build-1")
	if err != nil || status != http.StatusOK {
		t.Fatalf("imagebuilds detail: status=%d err=%v", status, err)
	}
}
