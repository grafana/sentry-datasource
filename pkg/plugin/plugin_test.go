package plugin_test

import (
	"context"
	"errors"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	. "github.com/grafana/sentry-datasource/pkg/errors"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/grafana/sentry-datasource/pkg/util"
	"github.com/stretchr/testify/assert"
)

func Test_QueryData(t *testing.T) {
	t.Run("invalid query should throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(util.NewFakeClient(util.FakeDoer{}))
		ctx := context.TODO()
		res, _ := ds.QueryData(ctx, &backend.QueryDataRequest{Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{}`)}}})
		assert.Equal(t, ErrorUnknownQueryType, res.Responses["A"].Error)
	})

	t.Run("invalid response should capture error", func(t *testing.T) {
		client := util.NewFakeClient(util.FakeDoer{Body: "{}", ExpectedStatusCode: 400, ExpectedStatus: "400 Unknown error"})
		ds := plugin.NewDatasourceInstance(client)
		ctx := context.TODO()
		res, _ := ds.QueryData(ctx, &backend.QueryDataRequest{Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
			"queryType" : "issues"
		}`)}}})
		assert.NotNil(t, res.Responses["A"].Error)
		assert.Equal(t, errors.New("400 Unknown error"), res.Responses["A"].Error)
	})

	t.Run("invalid response with valid status code should capture error", func(t *testing.T) {
		client := util.NewFakeClient(util.FakeDoer{Body: "{}"})
		ds := plugin.NewDatasourceInstance(client)
		ctx := context.TODO()
		res, _ := ds.QueryData(ctx, &backend.QueryDataRequest{Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
			"queryType" : "issues"
		}`)}}})
		assert.NotNil(t, res.Responses["A"].Error)
		assert.Equal(t, "json: cannot unmarshal object into Go value of type []sentry.SentryIssue", res.Responses["A"].Error.Error())
	})

	t.Run("invalid response should capture error detail if available", func(t *testing.T) {
		client := util.NewFakeClient(util.FakeDoer{Body: `{ "detail" : "simulated error" }`, ExpectedStatusCode: 400, ExpectedStatus: "400 Unknown error"})
		ds := plugin.NewDatasourceInstance(client)
		ctx := context.TODO()
		res, _ := ds.QueryData(ctx, &backend.QueryDataRequest{Queries: []backend.DataQuery{{RefID: "A", JSON: []byte(`{
			"queryType" : "issues"
		}`)}}})
		assert.NotNil(t, res.Responses["A"].Error)
		assert.Equal(t, errors.New("400 Unknown error simulated error"), res.Responses["A"].Error)
	})
}

func Test_CheckHealth(t *testing.T) {
	t.Run("invalid auth token should throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(util.NewFakeClient(util.FakeDoer{AuthToken: "incorrect-token"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusError, hc.Status)
		assert.Equal(t, "401 Unauthorized", hc.Message)
	})

	t.Run("valid auth token should not throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(util.NewFakeClient(util.FakeDoer{Body: "[]"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusOk, hc.Status)
		assert.Equal(t, "plugin health check successful. 0 projects found.", hc.Message)
	})

	t.Run("should return organizations length", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(util.NewFakeClient(util.FakeDoer{Body: "[{},{}]"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusOk, hc.Status)
		assert.Equal(t, "plugin health check successful. 2 projects found.", hc.Message)
	})

	t.Run("invalid response should throw error", func(t *testing.T) {
		ds := plugin.NewDatasourceInstance(util.NewFakeClient(util.FakeDoer{Body: "{}"}))
		ctx := context.TODO()
		req := &backend.CheckHealthRequest{}
		hc, err := ds.CheckHealth(ctx, req)
		assert.Nil(t, err)
		assert.Equal(t, backend.HealthStatusError, hc.Status)
		assert.Equal(t, "json: cannot unmarshal object into Go value of type []sentry.SentryProject", hc.Message)
	})
}
