package plugin_test

import (
	"context"
	"errors"
	"testing"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func GetFrameLabels(frame *data.Frame) []string {
	labels := make([]string, len(frame.Fields))
	for i := range frame.Fields {
		labels[i] = frame.Fields[i].Name
	}
	return labels
}

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
	t.Run("valid events stats query should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"": {
				"data": [
					[1, [{ "count": 123.0 }]],
					[2, [{ "count": 234.0 }]]
				],
				"order": 0,
				"isMetricsData": false,
				"meta": {}
			}
		}`})
		query := `{
			"queryType" : "eventsStats",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"eventsStatsQuery" : "event_query",
			"eventsStatsYAxis": ["event_yaxis"],
			"eventsStatsGroups": [],
			"eventsStatsSort" : "event_sort",
			"eventsStatsLimit" : 10
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)

		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "EventsStats (A)", res.Frames[0].Name)

		// Assert the content of the data frame
		frame := res.Frames[0]
		require.NotNil(t, frame.Fields)
		require.Equal(t, 2, len(frame.Fields))
		assert.Equal(t, 2, frame.Fields[0].Len())
		require.Equal(t, "Timestamp", frame.Fields[0].Name)
		require.Equal(t, "", frame.Fields[1].Name)
	})
	t.Run("valid grouped events stats query should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"Group A": {
				"data": [
					[1, [{ "count": 123.0 }]],
					[2, [{ "count": 234.0 }]]
				],
				"order": 0,
				"isMetricsData": false,
				"meta": {}
			},
			"Group B": {
				"data": [
					[1, [{ "count": 345.0 }]],
					[2, [{ "count": 696.0 }]]
				],
				"order": 1,
				"isMetricsData": false,
				"meta": {}
			}
		}`})
		query := `{
			"queryType" : "eventsStats",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"eventsStatsQuery" : "event_query",
			"eventsStatsYAxis": ["event_yaxis"],
			"eventsStatsGroups": ["event_group"],
			"eventsStatsSort" : "event_sort",
			"eventsStatsLimit" : 10
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)

		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "EventsStats (A)", res.Frames[0].Name)

		// Assert the content of the data frame
		frame := res.Frames[0]
		require.NotNil(t, frame.Fields)
		require.Equal(t, 3, len(frame.Fields))
		assert.Equal(t, 2, frame.Fields[0].Len())
		labels := GetFrameLabels(frame)
		assert.Contains(t, labels, "Timestamp")
		assert.Contains(t, labels, "Group A")
		assert.Contains(t, labels, "Group B")
	})
	t.Run("valid multiple yAxis events stats query should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"Group A": {
				"event_yaxis_a": {
					"data": [
						[1, [{ "count": 885.0 }]],
						[2, [{ "count": 951.0 }]]
					],
					"order": 0,
					"isMetricsData": false,
					"meta": {}
				},
				"event_yaxis_b": {
					"data": [
						[1, [{ "count": 146 }]],
						[2, [{ "count": 53 }]]
					],
					"order": 1,
					"isMetricsData": false,
					"meta": {}
				},
				"order": 0
			},
			"Group B": {
				"event_yaxis_a": {
					"data": [
						[1, [{ "count": 697.0 }]],
						[2, [{ "count": 696.0 }]]
					],
					"order": 0,
					"isMetricsData": false,
					"meta": {}
				},
				"event_yaxis_b": {
					"data": [
						[1, [{ "count": 395 }]],
						[2, [{ "count": 150 }]]
					],
					"order": 1,
					"isMetricsData": false,
					"meta": {}
				},
				"order": 1
			}
		}`})
		query := `{
			"queryType" : "eventsStats",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"eventsStatsQuery" : "event_query",
			"eventsStatsYAxis": ["event_yaxis_a", "event_yaxis_b"],
			"eventsStatsGroups": ["event_group"],
			"eventsStatsSort" : "event_sort",
			"eventsStatsLimit" : 10
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)

		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "EventsStats (A)", res.Frames[0].Name)

		// Assert the content of the data frame
		frame := res.Frames[0]
		require.NotNil(t, frame.Fields)
		require.Equal(t, 5, len(frame.Fields))
		assert.Equal(t, 2, frame.Fields[0].Len())
		labels := GetFrameLabels(frame)
		assert.Contains(t, labels, "Timestamp")
		assert.Contains(t, labels, "Group A: event_yaxis_a")
		assert.Contains(t, labels, "Group A: event_yaxis_b")
		assert.Contains(t, labels, "Group B: event_yaxis_a")
		assert.Contains(t, labels, "Group B: event_yaxis_b")
	})
	t.Run("events stats with null values should be handled gracefully", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"data": [
				[1, [{ "count": null }]],
				[2, [{ "count": 234.0 }]]
			],
			"order": 0,
			"isMetricsData": false,
			"start": 1,
			"end": 2,
			"meta": {
				"fields": {},
				"units": {},
				"isMetricsData": false,
				"isMetricsExtractedData": false,
				"tips": {},
				"datasetReason": "unchanged",
				"dataset": "discover"
			}
		}`})
		query := `{
			"queryType" : "eventsStats",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"eventsStatsQuery" : "event_query",
			"eventsStatsYAxis": ["event_yaxis"],
			"eventsStatsGroups": [],
			"eventsStatsSort" : "event_sort",
			"eventsStatsLimit" : 10
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)

		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)

		// Assert the content of the data frame
		frame := res.Frames[0]
		firstValue, _ := frame.Fields[1].NullableFloatAt(0)
		secondValue, _ := frame.Fields[1].NullableFloatAt(1)
		require.Nil(t, firstValue)
		require.NotNil(t, secondValue)
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
	t.Run("valid metrics query should produce correct result", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"start": "2021-07-15T15:00:00Z",
			"end": "2021-10-13T15:59:00Z",
			"intervals": ["2021-07-15T15:00:00Z", "2021-07-15T15:30:00Z"],
			"groups":[{ "by": {}, "series": { "session.crash_rate" : [ 0.0002941324772677614, 0.0002764405454278872 ] } }],
			"meta": [],
			"query": ""
		}`})
		query := `{
			"queryType" : "metrics",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"metricsQuery" : "metrics_query",
			"metricsField" : "metrics_field"
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)

		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Metrics (A)", res.Frames[0].Name)

		// Assert the content of the data frame
		frame := res.Frames[0]
		require.NotNil(t, frame.Fields)
		require.Equal(t, 2, len(frame.Fields))
		assert.Equal(t, 2, frame.Fields[0].Len())
		require.Equal(t, "Timestamp", frame.Fields[0].Name)
		require.Equal(t, "session.crash_rate", frame.Fields[1].Name)
	})
	t.Run("grouped metrics query should handle null values", func(t *testing.T) {
		sc := NewFakeClient(fakeDoer{Body: `{
			"start": "2021-07-15T15:00:00Z",
			"end": "2021-10-13T15:59:00Z",
			"intervals": ["2021-07-15T15:00:00Z", "2021-07-15T15:30:00Z"],
			"groups":[
				{ 
					"by": { "release": "version-1.0" }, 
					"series": { "count_unique(sentry.sessions.user)" : [ 0.0002941324772677614, 0.0002764405454278872 ] }
				},
				{ 
					"by": { "release": "version-1.1" }, 
					"series": { "count_unique(sentry.sessions.user)" : [ null, 0.0002764405454278872 ] }
				}
			],
			"meta": [],
			"query": "metrics_query"
		}`})
		query := `{
			"queryType" : "metrics",
			"projectIds" : ["project_id"],
			"environments" : ["dev"],
			"metricsQuery" : "metrics_query",
			"metricsField" : "metrics_field",
			"metricsGroup" : "metrics_group",
			"metricsSort" : "metrics_sort",
			"metricsOrder" : "metrics_order",
			"metricsLimit" : 5
		}`
		res := plugin.QueryData(context.Background(), backend.PluginContext{}, backend.DataQuery{RefID: "A", JSON: []byte(query)}, *sc)

		// Assert that there are no errors and the data frame is correctly formed
		assert.Nil(t, res.Error)
		require.Equal(t, 1, len(res.Frames))
		assert.Equal(t, "Metrics (A)", res.Frames[0].Name)

		// Assert the content of the data frame
		frame := res.Frames[0]
		require.NotNil(t, frame.Fields)
		require.Equal(t, 3, len(frame.Fields))
		assert.Equal(t, 2, frame.Fields[0].Len())
		labels := GetFrameLabels(frame)
		assert.Contains(t, labels, "Timestamp")
		assert.Contains(t, labels, "version-1.0")
		assert.Contains(t, labels, "version-1.1")
	})
}
