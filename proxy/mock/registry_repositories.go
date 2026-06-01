package mock

import (
	"encoding/json"
	"strings"
)

type repositoryListItem struct {
	Spec struct {
		Type string `json:"type"`
	} `json:"spec"`
}

type repositoryListEnvelope struct {
	Items []json.RawMessage `json:"items"`
}

func filterRepositoryList(data []byte, fieldSelector string) ([]byte, error) {
	fieldSelector = strings.TrimSpace(fieldSelector)
	if fieldSelector == "" {
		return data, nil
	}

	var envelope repositoryListEnvelope
	if err := json.Unmarshal(data, &envelope); err != nil {
		return nil, err
	}

	wantType := parseRepositoryTypeSelector(fieldSelector)
	if wantType == "" {
		return data, nil
	}

	filtered := make([]json.RawMessage, 0, len(envelope.Items))
	for _, raw := range envelope.Items {
		var item repositoryListItem
		if err := json.Unmarshal(raw, &item); err != nil {
			return nil, err
		}
		if item.Spec.Type == wantType {
			filtered = append(filtered, raw)
		}
	}

	envelope.Items = filtered
	return json.Marshal(envelope)
}

func parseRepositoryTypeSelector(fieldSelector string) string {
	for _, part := range strings.Split(fieldSelector, ",") {
		part = strings.TrimSpace(part)
		if strings.HasPrefix(part, "spec.type=") {
			return strings.TrimPrefix(part, "spec.type=")
		}
	}
	return ""
}
