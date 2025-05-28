package mocker

import (
	"bytes"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func Mock(req *http.Request) (*http.Response, error) {
	backend.Logger.Error("responding via mock", "method", req.Method, "url", req.URL.String())
	if req.Header.Get("Authorization") == "" {
		return &http.Response{
			StatusCode: http.StatusUnauthorized,
			Status:     "401 Unauthorized",
			Body:       io.NopCloser(bytes.NewBufferString(`{ "detail": "Authentication credentials were not provided." }`)),
		}, nil
	}
	if req.Header.Get("Authorization") != "Bearer mock-token" {
		return &http.Response{
			StatusCode: http.StatusUnauthorized,
			Status:     "401 Unauthorized",
			Body:       io.NopCloser(bytes.NewBufferString(`{ "detail": "Invalid token" }`)),
		}, nil
	}
	var body = io.NopCloser(bytes.NewBufferString("{}"))
	switch req.URL.Path {
	default:
		file := filepath.Join(basePath(), "./testdata/projects.json")
		if b, err := os.ReadFile(file); err == nil {
			body = io.NopCloser(bytes.NewReader(b))
		}
	}
	return &http.Response{
		StatusCode: http.StatusOK,
		Status:     "200 OK",
		Body:       body,
	}, nil
}

func basePath() string {
	mockSource, present := os.LookupEnv("GRAFANA_SENTRY_MOCK_SOURCE")
	if present && mockSource == "local_mock" {
		return filepath.Dir("/mock/grafana-sentry-datasource/")
	}
	_, b, _, _ := runtime.Caller(0)
	return filepath.Dir(b)
}
