package plugin_test

import (
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/stretchr/testify/assert"
)

func Test_checkHealth(t *testing.T) {
	t.Run("invalid auth token should throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{AuthToken: "incorrect-token"})
		hc, err := plugin.CheckHealth(*sc)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusError, hc.Status)
		assert.Equal(t, "401 Unauthorized", hc.Message)
	})
	t.Run("valid auth token should not throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{})
		hc, err := plugin.CheckHealth(*sc)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusOk, hc.Status)
		assert.Equal(t, "plugin health check successful. 0 organizations found.", hc.Message)
	})
	t.Run("should return organizations length", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "[{},{}]"})
		hc, err := plugin.CheckHealth(*sc)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusOk, hc.Status)
		assert.Equal(t, "plugin health check successful. 2 organizations found.", hc.Message)
	})
	t.Run("invalid response should throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "{}"})
		hc, err := plugin.CheckHealth(*sc)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusError, hc.Status)
		assert.Equal(t, "json: cannot unmarshal object into Go value of type []sentry.SentryOrganization", hc.Message)
	})
}
