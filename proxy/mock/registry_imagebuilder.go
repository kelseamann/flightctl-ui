package mock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

const imageBuilderFixturePrefix = "imagebuilder/"

// ImageBuilderResult is the resolved mock response for an imagebuilder API path.
type ImageBuilderResult struct {
	Body        []byte
	Status      int
	Err         error
	ContentType string // empty means application/json
}

// ResolveImageBuilderFixture returns JSON for /api/imagebuilder/{forward} paths.
func (s *Store) ResolveImageBuilderFixture(method, forwardPath string) ([]byte, int, error) {
	result := s.ResolveImageBuilder(method, forwardPath)
	return result.Body, result.Status, result.Err
}

// ResolveImageBuilder returns a mock response for /api/imagebuilder/{forward} paths.
func (s *Store) ResolveImageBuilder(method, forwardPath string) ImageBuilderResult {
	forwardPath = strings.TrimPrefix(strings.TrimSpace(forwardPath), "/")
	if forwardPath == "" {
		return ImageBuilderResult{Status: http.StatusNotFound, Err: fmt.Errorf("empty path")}
	}

	pathOnly := forwardPath
	query := ""
	if idx := strings.Index(pathOnly, "?"); idx >= 0 {
		query = pathOnly[idx+1:]
		pathOnly = pathOnly[:idx]
	}

	follow := false
	if query != "" {
		if values, err := url.ParseQuery(query); err == nil {
			follow = values.Get("follow") == "true"
		}
	}

	switch method {
	case http.MethodGet:
		return s.resolveImageBuilderGet(pathOnly, follow)
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		body, status, err := s.resolveMutation(method, pathOnly)
		return ImageBuilderResult{Body: body, Status: status, Err: err}
	default:
		return ImageBuilderResult{
			Status: http.StatusMethodNotAllowed,
			Err:    fmt.Errorf("method %s not supported in mock mode", method),
		}
	}
}

func (s *Store) resolveImageBuilderGet(pathOnly string, follow bool) ImageBuilderResult {
	if logPath, ok := parseImageBuilderLogPath(pathOnly); ok {
		body, status, contentType, err := s.resolveImageBuilderLog(logPath.collection, logPath.name, follow)
		return ImageBuilderResult{Body: body, Status: status, Err: err, ContentType: contentType}
	}
	switch pathOnly {
	case "api/v1/imagebuilds":
		body, status, err := s.mustRead(imageBuilderFixturePrefix + "imagebuilds.list.json")
		return ImageBuilderResult{Body: body, Status: status, Err: err}
	case "api/v1/imagepromotions":
		body, status, err := s.mustRead(imageBuilderFixturePrefix + "imagepromotions.list.json")
		return ImageBuilderResult{Body: body, Status: status, Err: err}
	case "api/v1/imageexports":
		body, status, err := s.mustRead(imageBuilderFixturePrefix + "imageexports.list.json")
		return ImageBuilderResult{Body: body, Status: status, Err: err}
	}

	if detail, ok := parseDetailPath(pathOnly); ok {
		body, status, err := s.resolveFixtureDetail(imageBuilderFixturePrefix, detail)
		return ImageBuilderResult{Body: body, Status: status, Err: err}
	}

	return ImageBuilderResult{
		Status: http.StatusNotFound,
		Err:    fmt.Errorf("no fixture for GET %s", pathOnly),
	}
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
