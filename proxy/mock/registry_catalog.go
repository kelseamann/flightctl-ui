package mock

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
)

type catalogItemMeta struct {
	Metadata struct {
		Name    string `json:"name"`
		Catalog string `json:"catalog"`
	} `json:"metadata"`
}

func parseCatalogItemPath(pathOnly string) (catalogName, itemName string, ok bool) {
	const prefix = "api/v1/catalogs/"
	if !strings.HasPrefix(pathOnly, prefix) {
		return "", "", false
	}
	rest := strings.TrimPrefix(pathOnly, prefix)
	parts := strings.Split(rest, "/")
	if len(parts) == 3 && parts[0] != "" && parts[1] == "items" && parts[2] != "" {
		return parts[0], parts[2], true
	}
	return "", "", false
}

func (s *Store) resolveCatalogItemDetail(catalogName, itemName string) ([]byte, int, error) {
	listData, err := s.Read("flightctl/catalogitems.list.json")
	if err != nil {
		return nil, http.StatusNotFound, err
	}

	var envelope listEnvelope
	if err := json.Unmarshal(listData, &envelope); err != nil {
		return nil, http.StatusInternalServerError, err
	}

	for _, item := range envelope.Items {
		var meta catalogItemMeta
		if err := json.Unmarshal(item, &meta); err != nil {
			continue
		}
		if meta.Metadata.Name == itemName && meta.Metadata.Catalog == catalogName {
			return item, http.StatusOK, nil
		}
	}

	detailFile := fmt.Sprintf("flightctl/catalogitems.detail.%s.%s.json", catalogName, itemName)
	if data, err := s.Read(detailFile); err == nil {
		return data, http.StatusOK, nil
	}

	return nil, http.StatusNotFound, fmt.Errorf("no fixture for catalog item %s/%s", catalogName, itemName)
}
