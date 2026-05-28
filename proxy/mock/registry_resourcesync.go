package mock

import (
	"encoding/json"
	"strings"
)

type resourceSyncListItem struct {
	Metadata struct {
		Name string `json:"name"`
	} `json:"metadata"`
	Spec struct {
		Type       string `json:"type"`
		Repository string `json:"repository"`
	} `json:"spec"`
}

func filterResourceSyncList(data []byte, fieldSelector string) ([]byte, error) {
	fieldSelector = strings.TrimSpace(fieldSelector)
	if fieldSelector == "" {
		return data, nil
	}

	var envelope listEnvelope
	if err := json.Unmarshal(data, &envelope); err != nil {
		return nil, err
	}

	selectors := splitFieldSelectors(fieldSelector)
	filtered := make([]json.RawMessage, 0, len(envelope.Items))
	for _, item := range envelope.Items {
		var rs resourceSyncListItem
		if err := json.Unmarshal(item, &rs); err != nil {
			continue
		}
		if resourceSyncMatchesSelectors(rs, selectors) {
			filtered = append(filtered, item)
		}
	}
	envelope.Items = filtered
	return json.Marshal(envelope)
}

func splitFieldSelectors(fieldSelector string) []string {
	parts := strings.Split(fieldSelector, ",")
	selectors := make([]string, 0, len(parts))
	for _, part := range parts {
		if trimmed := strings.TrimSpace(part); trimmed != "" {
			selectors = append(selectors, trimmed)
		}
	}
	return selectors
}

func resourceSyncMatchesSelectors(rs resourceSyncListItem, selectors []string) bool {
	rsType := rs.Spec.Type
	if rsType == "" {
		rsType = "fleet"
	}

	for _, selector := range selectors {
		switch {
		case selector == "spec.type!=catalog":
			if rsType == "catalog" {
				return false
			}
		case selector == "spec.type==catalog":
			if rsType != "catalog" {
				return false
			}
		case strings.HasPrefix(selector, "spec.repository="):
			if rs.Spec.Repository != strings.TrimPrefix(selector, "spec.repository=") {
				return false
			}
		case strings.HasPrefix(selector, "metadata.name contains "):
			needle := strings.TrimPrefix(selector, "metadata.name contains ")
			if !strings.Contains(rs.Metadata.Name, needle) {
				return false
			}
		}
	}
	return true
}
