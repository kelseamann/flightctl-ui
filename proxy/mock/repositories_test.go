package mock

import (
	"net/http"
	"path/filepath"
	"strings"
	"testing"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

func TestFilterRepositoryList(t *testing.T) {
	log.InitLogs()
	root := filepath.Join("..", "fixtures")
	config.DevMockFixturesDir = root

	store, err := NewStore()
	if err != nil {
		t.Fatalf("NewStore: %v", err)
	}

	ociBody, status, err := store.ResolveFixture(http.MethodGet, "api/v1/repositories?fieldSelector=spec.type=oci")
	if err != nil || status != http.StatusOK {
		t.Fatalf("oci fieldSelector: status=%d err=%v", status, err)
	}
	if !strings.Contains(string(ociBody), "oci-registry") {
		t.Fatalf("oci fieldSelector: expected oci-registry in response")
	}
	if strings.Contains(string(ociBody), "git-init-repo") {
		t.Fatalf("oci fieldSelector: did not expect git-init-repo in response")
	}

	gitBody, status, err := store.ResolveFixture(http.MethodGet, "api/v1/repositories?fieldSelector=spec.type=git")
	if err != nil || status != http.StatusOK {
		t.Fatalf("git fieldSelector: status=%d err=%v", status, err)
	}
	if !strings.Contains(string(gitBody), "git-init-repo") {
		t.Fatalf("git fieldSelector: expected git-init-repo in response")
	}
}
