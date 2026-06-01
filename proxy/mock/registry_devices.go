package mock

import (
	"encoding/json"
	"net/http"
	"strings"
)

func parseDeviceLastSeenPath(pathOnly string) (deviceName string, ok bool) {
	const prefix = "api/v1/devices/"
	if !strings.HasPrefix(pathOnly, prefix) || !strings.HasSuffix(pathOnly, "/lastseen") {
		return "", false
	}
	name := strings.TrimPrefix(pathOnly, prefix)
	name = strings.TrimSuffix(name, "/lastseen")
	if name == "" || strings.Contains(name, "/") {
		return "", false
	}
	return name, true
}

func (s *Store) resolveDeviceLastSeen(deviceName string) ([]byte, int, error) {
	_, status, err := s.resolveFixtureDetail("flightctl/", detailPath{
		collection: "devices",
		name:       deviceName,
	})
	if err != nil {
		return nil, status, err
	}

	body, err := json.Marshal(map[string]string{
		"lastSeen": "2024-04-10T14:05:00Z",
	})
	if err != nil {
		return nil, http.StatusInternalServerError, err
	}
	return body, http.StatusOK, nil
}
