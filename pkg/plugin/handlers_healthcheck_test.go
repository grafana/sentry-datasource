package plugin_test

import (
	"context"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/stretchr/testify/assert"
)

func Test_CheckHealth(t *testing.T) {
	t.Run("invalid auth token should throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(NewFakeClient(fakeDoer{AuthToken: "incorrect-token"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusError, hc.Status)
		assert.Equal(t, "401 Unauthorized", hc.Message)
	})
	t.Run("valid auth token should not throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(NewFakeClient(fakeDoer{Body: "[]"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusOk, hc.Status)
		assert.Equal(t, "plugin health check successful. 0 projects found.", hc.Message)
	})
	t.Run("should return organizations length", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(NewFakeClient(fakeDoer{Body: "[{},{}]"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusOk, hc.Status)
		assert.Equal(t, "plugin health check successful. 2 projects found.", hc.Message)
	})
	t.Run("invalid response should throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(NewFakeClient(fakeDoer{Body: "{}"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusError, hc.Status)
		assert.Equal(t, "json: cannot unmarshal object into Go value of type []sentry.SentryProject", hc.Message)
	})
}
