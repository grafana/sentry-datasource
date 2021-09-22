package plugin_test

import (
	"context"
	"testing"

	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestCallResource(t *testing.T) {
	t.Run("invalid query should return error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{})
		out, err := plugin.CallResource(context.Background(), *sc, plugin.SentryResourceQuery{})
		assert.Equal(t, err, plugin.ErrorInvalidResourceCallQuery)
		assert.Nil(t, out)
	})
	t.Run("correct organizations should return data", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "[{},{},{}]"})
		out, err := plugin.CallResource(context.Background(), *sc, plugin.SentryResourceQuery{Type: "organizations"})
		assert.Nil(t, err)
		assert.NotNil(t, out)
		assert.Equal(t, 3, len(out.([]sentry.SentryOrganization)))
	})
}

func TestGetResourceQuery(t *testing.T) {
	t.Run("empty query should throw error", func(t *testing.T) {
		q, err := plugin.GetResourceQuery([]byte(``))
		assert.Nil(t, q)
		assert.Equal(t, plugin.ErrorFailedUnmarshalingResourceQuery, err)
	})
	t.Run("invalid query should throw error", func(t *testing.T) {
		q, err := plugin.GetResourceQuery([]byte(`{}`))
		assert.Nil(t, q)
		assert.Equal(t, plugin.ErrorInvalidResourceCallQuery, err)
	})

	t.Run("valid organizations query should parse correctly", func(t *testing.T) {
		q, err := plugin.GetResourceQuery([]byte(`{ "type" : "organizations" }`))
		assert.Nil(t, err)
		assert.Equal(t, &plugin.SentryResourceQuery{Type: "organizations"}, q)
	})
}
