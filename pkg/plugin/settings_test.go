package plugin_test

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/errors"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/grafana/sentry-datasource/pkg/util"
	"github.com/stretchr/testify/assert"
)

func TestGetSettings(t *testing.T) {
	t.Run("invalid settings should throw unmarshal error", func(t *testing.T) {
		_, err := plugin.GetSettings(backend.DataSourceInstanceSettings{})
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorUnmarshalingSettings, err)
		_, err = plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`invalid json`)})
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorUnmarshalingSettings, err)
	})
	t.Run("missing org slug should throw error", func(t *testing.T) {
		_, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{}`)})
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorInvalidOrganizationSlug, err)
	})
	t.Run("missing auth token should throw error", func(t *testing.T) {
		_, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{ "orgSlug": "foo" }`)})
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorInvalidAuthToken, err)
	})
	t.Run("valid settings should correctly parsed and default url should apply", func(t *testing.T) {
		settings, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{ "orgSlug": "foo" }`), DecryptedSecureJSONData: map[string]string{"authToken": "bar"}})
		assert.Nil(t, err)
		assert.Equal(t, util.DefaultSentryURL, settings.URL)
		assert.Equal(t, "foo", settings.OrgSlug)
	})
	t.Run("url override should apply", func(t *testing.T) {
		settings, err := plugin.GetSettings(backend.DataSourceInstanceSettings{JSONData: []byte(`{  "url" : "https://foo.com", "orgSlug": "foo"  }`), DecryptedSecureJSONData: map[string]string{"authToken": "bar"}})
		assert.Nil(t, err)
		assert.Equal(t, "https://foo.com", settings.URL)
		assert.Equal(t, "foo", settings.OrgSlug)
	})
}

func TestSentryConfig_validate(t *testing.T) {
	t.Run("invalid URL should throw error", func(t *testing.T) {
		sc := &plugin.SentryConfig{}
		err := sc.Validate()
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorInvalidSentryConfig, err)
	})
	t.Run("invalid org slug should throw error", func(t *testing.T) {
		sc := &plugin.SentryConfig{URL: "https://foo.com"}
		err := sc.Validate()
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorInvalidOrganizationSlug, err)
	})
	t.Run("invalid password should throw error", func(t *testing.T) {
		sc := &plugin.SentryConfig{URL: "https://foo.com", OrgSlug: "foo"}
		err := sc.Validate()
		assert.NotNil(t, err)
		assert.Equal(t, errors.ErrorInvalidAuthToken, err)
	})
}
