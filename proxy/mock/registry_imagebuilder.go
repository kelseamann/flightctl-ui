package mock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

const imageBuilderFixturePrefix = "imagebuilder/"

// ResolveImageBuilderFixture returns JSON for /api/imagebuilder/{forward} paths.
func (s *Store) ResolveImageBuilderFixture(method, forwardPath string) ([]byte, int, error) {
	forwardPath = strings.TrimPrefix(strings.TrimSpace(forwardPath), "/")
	if forwardPath == "" {
		return nil, http.StatusNotFound, fmt.Errorf("empty path")
	}

	pathOnly := forwardPath
	if idx := strings.Index(pathOnly, "?"); idx >= 0 {
		pathOnly = pathOnly[:idx]
	}

	switch method {
	case http.MethodGet:
		return s.resolveImageBuilderGet(pathOnly)
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return s.resolveMutation(method, pathOnly)
	default:
		return nil, http.StatusMethodNotAllowed, fmt.Errorf("method %s not supported in mock mode", method)
	}
}

func (s *Store) resolveImageBuilderGet(pathOnly string) ([]byte, int, error) {
	switch pathOnly {
	case "api/v1/imagebuilds":
		return s.mustRead(imageBuilderFixturePrefix + "imagebuilds.list.json")
	case "api/v1/imagepromotions":
		return s.mustRead(imageBuilderFixturePrefix + "imagepromotions.list.json")
	case "api/v1/imageexports":
		return s.mustRead(imageBuilderFixturePrefix + "imageexports.list.json")
	}

	if detail, ok := parseDetailPath(pathOnly); ok {
		return s.resolveFixtureDetail(imageBuilderFixturePrefix, detail)
	}

	return nil, http.StatusNotFound, fmt.Errorf("no fixture for GET %s", pathOnly)
}

func (s *Store) resolveFixtureDetail(prefix string, d detailPath) ([]byte, int, error) {
	listFile := fmt.Sprintf("%s%s.list.json", prefix, d.collection)
	listData, err := s.Read(listFile)
	if err != nil {
		return nil, http.StatusNotFound, err
	}

	var envelope listEnvelope
	if err := json.Unmarshal(listData, &envelope); err != nil {
		return nil, http.StatusInternalServerError, err
	}

	for _, item := range envelope.Items {
		var meta listItem
		if err := json.Unmarshal(item, &meta); err != nil {
			continue
		}
		if meta.Metadata.Name == d.name {
			return item, http.StatusOK, nil
		}
	}

	detailFile := fmt.Sprintf("%s%s.detail.%s.json", prefix, d.collection, d.name)
	if data, err := s.Read(detailFile); err == nil {
		return data, http.StatusOK, nil
	}

	return nil, http.StatusNotFound, fmt.Errorf("no fixture for %s/%s", d.collection, d.name)
}
