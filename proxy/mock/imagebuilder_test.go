package mock

import (
	"net/http"
	"os"
	"path/filepath"
	"strings"
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

	logBody, logStatus, logErr := store.ResolveImageBuilderFixture(http.MethodGet, "api/v1/imagebuilds/demo-build-1/log")
	if logErr != nil || logStatus != http.StatusOK {
		t.Fatalf("imagebuilds log: status=%d err=%v", logStatus, logErr)
	}
	if !strings.Contains(string(logBody), "demo-build-1") {
		t.Fatalf("imagebuilds log body missing build name: %q", string(logBody))
	}

	logResult := store.ResolveImageBuilder(http.MethodGet, "api/v1/imagebuilds/demo-build-2/log?follow=true")
	if logResult.Err != nil || logResult.Status != http.StatusOK {
		t.Fatalf("imagebuilds streaming log: status=%d err=%v", logResult.Status, logResult.Err)
	}
	if logResult.ContentType != "text/event-stream" {
		t.Fatalf("expected text/event-stream, got %q", logResult.ContentType)
	}
}
