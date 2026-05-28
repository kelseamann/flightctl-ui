package mock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
)

type listItem struct {
	Metadata struct {
		Name string `json:"name"`
	} `json:"metadata"`
}

type listEnvelope struct {
	Items []json.RawMessage `json:"items"`
}

// ResolveFixture returns JSON bytes for a Flight Control API forward path (e.g. api/v1/fleets).
func (s *Store) ResolveFixture(method, forwardPath string) ([]byte, int, error) {
	forwardPath = strings.TrimPrefix(strings.TrimSpace(forwardPath), "/")
	if forwardPath == "" {
		return nil, http.StatusNotFound, fmt.Errorf("empty path")
	}

	fieldSelector := ""
	pathOnly := forwardPath
	if idx := strings.Index(pathOnly, "?"); idx >= 0 {
		if values, err := url.ParseQuery(pathOnly[idx+1:]); err == nil {
			fieldSelector = values.Get("fieldSelector")
		}
		pathOnly = pathOnly[:idx]
	}

	switch method {
	case http.MethodGet:
		return s.resolveGet(pathOnly, fieldSelector)
	case http.MethodPost, http.MethodPut, http.MethodPatch, http.MethodDelete:
		return s.resolveMutation(method, pathOnly)
	default:
		return nil, http.StatusMethodNotAllowed, fmt.Errorf("method %s not supported in mock mode", method)
	}
}

func (s *Store) resolveGet(pathOnly string, fieldSelector string) ([]byte, int, error) {
	switch pathOnly {
	case "api/v1/organizations":
		return s.mustRead("flightctl/organizations.list.json")
	case "api/v1/auth/permissions":
		return s.mustRead("auth/permissions.json")
	case "api/v1/auth/config":
		return s.mustRead("auth/config.json")
	case "api/v1/auth/userinfo":
		return s.mustRead("auth/userinfo.json")
	case "api/v1/fleets":
		return s.mustRead("flightctl/fleets.list.json")
	case "api/v1/repositories":
		return s.mustRead("flightctl/repositories.list.json")
	case "api/v1/resourcesyncs":
		data, status, err := s.mustRead("flightctl/resourcesyncs.list.json")
		if err != nil {
			return nil, status, err
		}
		filtered, filterErr := filterResourceSyncList(data, fieldSelector)
		if filterErr != nil {
			return nil, http.StatusInternalServerError, filterErr
		}
		return filtered, status, nil
	case "api/v1/devices":
		return s.mustRead("flightctl/devices.list.json")
	case "api/v1/enrollmentrequests":
		return s.mustRead("flightctl/enrollmentrequests.list.json")
	case "api/v1/catalogs":
		return s.mustRead("flightctl/catalogs.list.json")
	case "api/v1/catalogitems":
		return s.mustRead("flightctl/catalogitems.list.json")
	}

	if catalogName, itemName, ok := parseCatalogItemPath(pathOnly); ok {
		return s.resolveCatalogItemDetail(catalogName, itemName)
	}

	if detail, ok := parseDetailPath(pathOnly); ok {
		return s.resolveFixtureDetail("flightctl/", detail)
	}

	return nil, http.StatusNotFound, fmt.Errorf("no fixture for GET %s", pathOnly)
}

type detailPath struct {
	collection string
	name       string
}

func parseDetailPath(pathOnly string) (detailPath, bool) {
	rest := strings.TrimPrefix(pathOnly, "api/v1/")
	parts := strings.Split(rest, "/")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return detailPath{}, false
	}
	return detailPath{collection: parts[0], name: parts[1]}, true
}

func (s *Store) resolveMutation(method, pathOnly string) ([]byte, int, error) {
	// Phase 1: accept mutations with empty object so forms do not hard-fail.
	_ = method
	_ = pathOnly
	return []byte(`{}`), http.StatusOK, nil
}

func (s *Store) mustRead(relativePath string) ([]byte, int, error) {
	data, err := s.Read(relativePath)
	if err != nil {
		return nil, http.StatusNotFound, err
	}
	return data, http.StatusOK, nil
}
