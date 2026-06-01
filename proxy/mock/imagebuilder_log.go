package mock

import (
	"fmt"
	"net/http"
	"strings"
)

type imageBuilderLogPath struct {
	collection string
	name       string
}

func parseImageBuilderLogPath(pathOnly string) (imageBuilderLogPath, bool) {
	rest := strings.TrimPrefix(pathOnly, "api/v1/")
	parts := strings.Split(rest, "/")
	if len(parts) != 3 || parts[2] != "log" {
		return imageBuilderLogPath{}, false
	}
	if parts[0] != "imagebuilds" && parts[0] != "imageexports" {
		return imageBuilderLogPath{}, false
	}
	if parts[1] == "" {
		return imageBuilderLogPath{}, false
	}
	return imageBuilderLogPath{collection: parts[0], name: parts[1]}, true
}

func (s *Store) resolveImageBuilderLog(collection, name string, follow bool) ([]byte, int, string, error) {
	relPath := fmt.Sprintf("%s%s.log.%s.txt", imageBuilderFixturePrefix, collection, name)
	data, err := s.Read(relPath)
	if err != nil {
		data = []byte(fmt.Sprintf(
			"Mock log output for %s %s\nStep 1/4: Resolving base image\nStep 2/4: Applying configuration\nStep 3/4: Building image layers\nStep 4/4: Pushing to registry\nBuild finished.\n",
			collection,
			name,
		))
	}

	if follow {
		return data, http.StatusOK, "text/event-stream", nil
	}
	return data, http.StatusOK, "text/plain; charset=utf-8", nil
}
