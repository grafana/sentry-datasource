package plugin_test

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/stretchr/testify/assert"
)

func TestGetSettings(t *testing.T) {
	t.Run("invalid settings should throw unmarshal error", func(t *testing.T) {
		_, err := plugin.GetSettings(backend.DataSourceInstanceSettings{})
		assert.NotNil(t, err)
		assert.Equal(t, plugin.ErrorUnmarshalingSettings, err)
		_, err = plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`invalid json`)})
		assert.NotNil(t, err)
		assert.Equal(t, plugin.ErrorUnmarshalingSettings, err)
	})
	t.Run("missing auth token should throw error", func(t *testing.T) {
		_, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{}`)})
		assert.NotNil(t, err)
		assert.Equal(t, plugin.ErrorInvalidAuthToken, err)
	})
	t.Run("valid settings should correctly parsed and default url should apply", func(t *testing.T) {
		settings, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{}`), DecryptedSecureJSONData: map[string]string{"authToken": "foo"}})
		assert.Nil(t, err)
		assert.Equal(t, plugin.DefaultSentryURL, settings.URL)
	})
	t.Run("url override should apply", func(t *testing.T) {
		settings, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{  "url" : "https://foo.com" }`), DecryptedSecureJSONData: map[string]string{"authToken": "foo"}})
		assert.Nil(t, err)
		assert.Equal(t, "https://foo.com", settings.URL)
	})
}

func TestSentryConfig_validate(t *testing.T) {
	t.Run("invalid URL should throw error", func(t *testing.T) {
		sc := &plugin.SentryConfig{}
		err := sc.Validate()
		assert.NotNil(t, err)
		assert.Equal(t, plugin.ErrorInvalidSentryConfig, err)
	})
	t.Run("invalid password should throw error", func(t *testing.T) {
		sc := &plugin.SentryConfig{URL: "https://foo.com"}
		err := sc.Validate()
		assert.NotNil(t, err)
		assert.Equal(t, plugin.ErrorInvalidAuthToken, err)
	})
	t.Run("valid url and password should not throw error", func(t *testing.T) {
		sc := &plugin.SentryConfig{URL: "https://foo.com", AuthToken: "bar"}
		err := sc.Validate()
		assert.Nil(t, err)
	})
}
