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
	t.Run("stats query without field should throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "{}"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2"
		}`)}, *sc)
		assert.NotNil(t, res.Error)
		assert.Equal(t, `at least one "field" is required`, res.Error.Error())
	})
	t.Run("stats query without category should throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "{}"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2", 
			"statsFields" : ["foo"]
		}`)}, *sc)
		assert.NotNil(t, res.Error)
		assert.Equal(t, `at least one "category" is required`, res.Error.Error())
	})
	t.Run("stats query with field and category should not throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: "{}"})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2", 
			"statsFields" : ["foo"],
			"statsCategory" : ["foo"]
		}`)}, *sc)
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Stats (A)", res.Frames[0].Name)
		require.Equal(t, 0, len(res.Frames[0].Fields))
	})
	t.Run("valid stats query should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"start":"2021-07-15T15:00:00Z",
			"end":"2021-10-13T18:00:00Z",
			"intervals": ["2021-07-15T15:00:00Z","2021-07-15T18:00:00Z"],
			"groups":[
				{ "by": {}, "series": { "sum(quantity)" : [ 11, 22 ]} }
			]
		}`})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2", 
			"statsFields" : ["foo"],
			"statsCategory" : ["foo"]
		}`)}, *sc)
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Stats (A)", res.Frames[0].Name)
		require.Equal(t, 2, len(res.Frames[0].Fields))
		require.Equal(t, 2, res.Frames[0].Fields[0].Len())
		require.Equal(t, "Timestamp", res.Frames[0].Fields[0].Name)
		require.Equal(t, "Sum (Quantity)", res.Frames[0].Fields[1].Name)
		require.Equal(t, "", res.Frames[0].Fields[1].Labels.String())

	})
	t.Run("valid stats query with valid group by should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"start":"2021-07-15T15:00:00Z",
			"end":"2021-10-13T18:00:00Z",
			"intervals": ["2021-07-15T15:00:00Z","2021-07-15T18:00:00Z"],
			"groups":[
				{ "by": { "reason":"foo", "category": "foo1" }, "series": { "sum(quantity)" : [ 11, 22 ], "sum(times_seen)" : [ 11, 22 ]} },
				{ "by": { "reason":"bar", "category": "foo2" }, "series": { "sum(quantity)" : [ 11, 22 ], "sum(times_seen)" : [ 11, 22 ]} }
			]
		}`})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2", 
			"statsFields" : ["foo"],
			"statsCategory" : ["foo"]
		}`)}, *sc)
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Stats (A)", res.Frames[0].Name)
		require.Equal(t, 5, len(res.Frames[0].Fields))
		require.Equal(t, 2, res.Frames[0].Fields[0].Len())
		require.Equal(t, "Timestamp", res.Frames[0].Fields[0].Name)
		require.Equal(t, "Sum (Quantity)", res.Frames[0].Fields[1].Name)
		require.Equal(t, "Sum (Times Seen)", res.Frames[0].Fields[2].Name)
		require.Equal(t, "Sum (Quantity)", res.Frames[0].Fields[3].Name)
		require.Equal(t, "Sum (Times Seen)", res.Frames[0].Fields[4].Name)
		require.Equal(t, "Category=foo1, Reason=foo", res.Frames[0].Fields[1].Labels.String())
		require.Equal(t, "Category=foo1, Reason=foo", res.Frames[0].Fields[2].Labels.String())
		require.Equal(t, "Category=foo2, Reason=bar", res.Frames[0].Fields[3].Labels.String())
		require.Equal(t, "Category=foo2, Reason=bar", res.Frames[0].Fields[4].Labels.String())
	})
	t.Run("valid events query should produce correct result", func(t *testing.T) {	
		sc := NewFakeClient(fakeDoer{Body: `{
			"data": [
				{
					"id": "event_id_1",
					"title": "event_title_1",
					"message": "event_description",
					"project.name": "project_name_1"
				},
				{
					"id": "event_id_2",
					"title": "event_title_2",
					"message": "event_description",
					"project.name": "project_name_1"
				},
				{
					"id": "event_id_3",
					"title": "event_title_3",
					"message": "event_description",
					"project.name": "project_name_2"
				}
			],
			"meta": {
				"fields": {
					"id": "string",
					"title": "string",
					"message": "string",
					"project.name": "string"
				}
			}
		  }`})
		query := `{
			"queryType" : "events",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"eventsQuery" : "event_query",
			"eventsSort" : "event_sort",
			"eventsLimit" : 10
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)
	
		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Events (A)", res.Frames[0].Name)	

		// Assert the content of the data frame
		frame := res.Frames[0]
		require.NotNil(t, frame.Fields)
		require.Equal(t, 11, len(frame.Fields))			
		assert.Equal(t, 3, frame.Fields[0].Len()) 
		require.Equal(t, "ID", frame.Fields[0].Name)
		require.Equal(t, "Title", frame.Fields[1].Name)
	})
    t.Run("stats query with incorrect interval by should throw error", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"start":"2021-07-15T15:00:00Z",
			"end":"2021-10-13T15:59:00Z",
			"intervals": ["2021-07-15T15:00:00Z","2021-07-15T15:30:00Z"],
			"groups":[
				{ "by": {}, "series": { "sum(quantity)" : [ 11, 22 ]} }
			]
		}`})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2",
			"statsFields" : ["sum(quantity)"],
			"statsCategory" : ["error"],
			"statsInterval": "30mins"
		}`)}, *sc)
        assert.NotNil(t, res.Error)
		assert.Equal(t, `"interval" should be in the format [number][unit] where unit is one of m/h/d/w`, res.Error.Error())
	})
    t.Run("valid stats query with valid interval by should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"start":"2021-07-15T15:00:00Z",
			"end":"2021-10-13T15:59:00Z",
			"intervals": ["2021-07-15T15:00:00Z","2021-07-15T15:30:00Z"],
			"groups":[
				{ "by": {}, "series": { "sum(quantity)" : [ 11, 22 ]} }
			]
		}`})
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(`{
			"queryType" : "statsV2",
			"statsFields" : ["sum(quantity)"],
			"statsCategory" : ["error"],
			"statsInterval": "30m"
		}`)}, *sc)
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Stats (A)", res.Frames[0].Name)
		require.Equal(t, 2, len(res.Frames[0].Fields))
		require.Equal(t, 2, res.Frames[0].Fields[0].Len())
		require.Equal(t, "Timestamp", res.Frames[0].Fields[0].Name)
		require.Equal(t, "Sum (Quantity)", res.Frames[0].Fields[1].Name)
		require.Equal(t, "", res.Frames[0].Fields[1].Labels.String())
    })
}
