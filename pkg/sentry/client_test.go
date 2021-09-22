package sentry_test

import (
	"errors"
	"fmt"
	"net/http"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/require"
)

const pluginId string = "grafana-sentry-datasource"
const dummyVersion string = "dummy-version"
const dummyPath string = "/some-path"
const authToken string = "dummy-auth-token"

func TestHttpClient(t *testing.T) {
	t.Run("it attaches the auth header", func(t *testing.T) {
		client := &fakeHttpClient{}
		c := sentry.NewHTTPClient(client, pluginId, stubBuildInfoProvider, authToken)
		req, err := http.NewRequest(http.MethodGet, dummyPath, nil)
		require.Nil(t, err)
		_, _ = c.Do(req)
		require.Equal(t, "Bearer "+authToken, client.req.Header.Get("Authorization"))
	})

	t.Run("it sets a custom user agent with the plugin header", func(t *testing.T) {
		client := &fakeHttpClient{}
		c := sentry.NewHTTPClient(client, pluginId, stubBuildInfoProvider, authToken)
		req, err := http.NewRequest(http.MethodGet, dummyPath, nil)
		require.Nil(t, err)
		_, _ = c.Do(req)
		require.Equal(t, fmt.Sprintf("%s/%s", pluginId, dummyVersion), client.req.UserAgent())
	})

	t.Run("it sets the version to 'unknown' when the buildInfoProvider returns an error", func(t *testing.T) {
		provider := func() (build.Info, error) {
			return build.Info{}, errors.New("500 Internal server error")
		}
		client := &fakeHttpClient{}
		c := sentry.NewHTTPClient(client, pluginId, provider, authToken)
		req, err := http.NewRequest(http.MethodGet, dummyPath, nil)
		require.Nil(t, err)
		_, _ = c.Do(req)
		require.Equal(t, fmt.Sprintf("%s/%s", pluginId, "unknown-version"), client.req.UserAgent())
	})
}

func stubBuildInfoProvider() (build.Info, error) {
	return build.Info{
		Version: dummyVersion,
	}, nil
}

type fakeHttpClient struct {
	req *http.Request
}

func (c *fakeHttpClient) Do(req *http.Request) (*http.Response, error) {
	c.req = req
	return nil, nil
}
