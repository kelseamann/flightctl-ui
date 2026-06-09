package mock

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"

	"github.com/flightctl/flightctl-ui/config"
	"github.com/flightctl/flightctl-ui/log"
)

// Store loads JSON fixture files from disk for dev mock mode.
type Store struct {
	root                    string
	mu                      sync.RWMutex
	extraEnrollmentRequests []json.RawMessage
}

func NewStore() (*Store, error) {
	root := config.DevMockFixturesDir
	if root == "" {
		root = defaultFixturesDir()
	}
	info, err := os.Stat(root)
	if err != nil {
		return nil, fmt.Errorf("mock fixtures directory %q: %w", root, err)
	}
	if !info.IsDir() {
		return nil, fmt.Errorf("mock fixtures path %q is not a directory", root)
	}
	log.GetLogger().Infof("DEV_MOCK_API: loading fixtures from %s", root)
	return &Store{root: root}, nil
}

func defaultFixturesDir() string {
	return filepath.Join("fixtures")
}

func (s *Store) Read(relativePath string) ([]byte, error) {
	s.mu.RLock()
	defer s.mu.RUnlock()
	full := filepath.Join(s.root, filepath.Clean(relativePath))
	absRoot, err := filepath.Abs(s.root)
	if err != nil {
		return nil, err
	}
	absFull, err := filepath.Abs(full)
	if err != nil {
		return nil, err
	}
	if absFull != absRoot && !filepath.HasPrefix(absFull, absRoot+string(os.PathSeparator)) {
		return nil, fmt.Errorf("fixture path escapes fixtures root")
	}
	return os.ReadFile(absFull)
}

func (s *Store) ReadJSON(relativePath string) (json.RawMessage, error) {
	data, err := s.Read(relativePath)
	if err != nil {
		return nil, err
	}
	if !json.Valid(data) {
		return nil, fmt.Errorf("fixture %q is not valid JSON", relativePath)
	}
	return json.RawMessage(data), nil
}
