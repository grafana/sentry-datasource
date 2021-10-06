package sentry

import (
	"fmt"
	"net/http"

	"github.com/grafana/grafana-plugin-sdk-go/build"
)

type doer interface {
	Do(*http.Request) (*http.Response, error)
}

// HTTP creates an HTTP client with a 'Do' method. It automatically injects
// the provided api token into every request with an `Authorization: Bearer AuthToken` header
type HTTPClient struct {
	doer
	pluginId  string
	version   string
	authToken string
}

// BuildInfoProvider is a function that returns the build.Info for the plugin
type BuildInfoProvider func() (build.Info, error)

// NewHTTPClient creates a new AuthHTTP client
func NewHTTPClient(d doer, pluginId string, b BuildInfoProvider, authToken string) HTTPClient {
	info, err := b()
	version := info.Version
	if err != nil {
		version = "unknown-version"
	}
	return HTTPClient{d, pluginId, version, authToken}
}

// Do attaches the sentry authentication header and the User-Agent header to
// the request and passes it to the injected http Doer
func (a HTTPClient) Do(req *http.Request) (*http.Response, error) {
	req.Header.Set("User-Agent", fmt.Sprintf("%s/%s", a.pluginId, a.version))
	req.Header.Add("Authorization", fmt.Sprintf("Bearer %s", a.authToken))
	return a.doer.Do(req)
}
