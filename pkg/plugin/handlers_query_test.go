package plugin_test

import (
	"context"
	"errors"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSentryDatasource_QueryData(t *testing.T) {
	t.Run("invalid query should throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{JSON: []byte(`{}`)}, *sc)
		assert.Equal(t, plugin.ErrorUnknownQueryType, res.Error)
	})
	t.Run("invalid response should capture error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "{}", ExpectedStatusCode: 400, ExpectedStatus: "400 Unknown error"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{JSON: []byte(`{ 
			"queryType" : "issues"
		}`)}, *sc)
		assert.NotNil(t, res.Error)
		assert.Equal(t, errors.New("400 Unknown error"), res.Error)
	})
	t.Run("invalid response with valid status code should capture error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "{}"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{JSON: []byte(`{ 
			"queryType" : "issues"
		}`)}, *sc)
		require.NotNil(t, res.Error)
		assert.Equal(t, "json: cannot unmarshal object into Go value of type []sentry.SentryIssue", res.Error.Error())
	})
	t.Run("invalid response should capture error detail if available", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{ "detail" : "simulated error" }`, ExpectedStatusCode: 400, ExpectedStatus: "400 Unknown error"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{JSON: []byte(`{ 
			"queryType" : "issues"
		}`)}, *sc)
		assert.NotNil(t, res.Error)
		assert.Equal(t, errors.New("400 Unknown error simulated error"), res.Error)
	})
	t.Run("valid org slug should not throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "[{},{},{}]"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "issues"
		}`)}, *sc)
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Issues (A)", res.Frames[0].Name)
		require.Equal(t, 32, len(res.Frames[0].Fields))
		require.Equal(t, 3, res.Frames[0].Fields[0].Len())
	})
}
