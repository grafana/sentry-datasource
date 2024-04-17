package plugin

import (
	"context"
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data/framestruct"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

type SentryQuery struct {
	QueryType         string   `json:"queryType"`
	ProjectIds        []string `json:"projectIds,omitempty"`
	Environments      []string `json:"environments,omitempty"`
	IssuesQuery       string   `json:"issuesQuery,omitempty"`
	IssuesSort        string   `json:"issuesSort,omitempty"`
	IssuesLimit       int64    `json:"issuesLimit,omitempty"`
	EventsQuery       string   `json:"eventsQuery,omitempty"`
	EventsSort        string   `json:"eventsSort,omitempty"`
	EventsLimit       int64    `json:"eventsLimit,omitempty"`
	EventsStatsQuery  string   `json:"eventsStatsQuery,omitempty"`
	EventsStatsYAxis  []string `json:"eventsStatsYAxis,omitempty"`
	EventsStatsGroups []string `json:"eventsStatsGroups,omitempty"`
	EventsStatsSort   string   `json:"eventsStatsSort,omitempty"`
	EventsStatsLimit  int64    `json:"eventsStatsLimit,omitempty"`
	StatsCategory     []string `json:"statsCategory,omitempty"`
	StatsFields       []string `json:"statsFields,omitempty"`
	StatsGroupBy      []string `json:"statsGroupBy,omitempty"`
	StatsInterval     string   `json:"statsInterval,omitempty"`
	StatsOutcome      []string `json:"statsOutcome,omitempty"`
	StatsReason       []string `json:"statsReason,omitempty"`
}

func GetQuery(query backend.DataQuery) (SentryQuery, error) {
	var out SentryQuery
	err := json.Unmarshal(query.JSON, &out)
	return out, err
}

func (ds *SentryDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	dsi, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		response.Responses["error"] = backend.DataResponse{Error: err}
		return response, nil
	}
	for _, q := range req.Queries {
		res := QueryData(ctx, req.PluginContext, q, dsi.sentryClient)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func QueryData(ctx context.Context, pCtx backend.PluginContext, backendQuery backend.DataQuery, client sentry.SentryClient) backend.DataResponse {
	response := backend.DataResponse{}
	query, err := GetQuery(backendQuery)
	if err != nil {
		return GetErrorResponse(response, "", err)
	}
	switch query.QueryType {
	case "issues":
		if client.OrgSlug == "" {
			return GetErrorResponse(response, "", ErrorInvalidOrganizationSlug)
		}
		issues, executedQueryString, err := client.GetIssues(sentry.GetIssuesInput{
			OrganizationSlug: client.OrgSlug,
			ProjectIds:       query.ProjectIds,
			Environments:     query.Environments,
			Query:            query.IssuesQuery,
			Sort:             query.IssuesSort,
			Limit:            query.IssuesLimit,
			From:             backendQuery.TimeRange.From,
			To:               backendQuery.TimeRange.To,
		})
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame, err := framestruct.ToDataFrame(GetFrameName("Issues", backendQuery.RefID), issues)
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame = UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
		response.Frames = append(response.Frames, frame)
	case "events":
		if client.OrgSlug == "" {
			return GetErrorResponse(response, "", ErrorInvalidOrganizationSlug)
		}
		events, executedQueryString, err := client.GetEvents(sentry.GetEventsInput{
			OrganizationSlug: client.OrgSlug,
			ProjectIds:       query.ProjectIds,
			Environments:     query.Environments,
			Query:            query.EventsQuery,
			Sort:             query.EventsSort,
			Limit:            query.EventsLimit,
			From:             backendQuery.TimeRange.From,
			To:               backendQuery.TimeRange.To,
		})
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame, err := framestruct.ToDataFrame(GetFrameName("Events", backendQuery.RefID), events)
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame = UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
		response.Frames = append(response.Frames, frame)
	case "eventsStats":
		if client.OrgSlug == "" {
			return GetErrorResponse(response, "", ErrorInvalidOrganizationSlug)
		}
		eventsStats, executedQueryString, err := client.GetEventsStats(sentry.GetEventsStatsInput{
			OrganizationSlug: client.OrgSlug,
			ProjectIds:       query.ProjectIds,
			Environments:     query.Environments,
			Query:            query.EventsStatsQuery,
			Fields:           append(query.EventsStatsYAxis, query.EventsStatsGroups...),
			YAxis:            query.EventsStatsYAxis,
			Sort:             query.EventsStatsSort,
			Limit:            query.EventsStatsLimit,
			Interval:         backendQuery.Interval,
			From:             backendQuery.TimeRange.From,
			To:               backendQuery.TimeRange.To,
		})
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame, err := ConvertEventsStatsResponseToFrame(GetFrameName("EventsStats", backendQuery.RefID), eventsStats)
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame = UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
		response.Frames = append(response.Frames, frame)
	case "statsV2":
		if client.OrgSlug == "" {
			return GetErrorResponse(response, "", ErrorInvalidOrganizationSlug)
		}
		stats, executedQueryString, err := client.GetStatsV2(sentry.GetStatsV2Input{
			OrganizationSlug: client.OrgSlug,
			From:             backendQuery.TimeRange.From,
			To:               backendQuery.TimeRange.To,
			ProjectIds:       query.ProjectIds,
			Category:         query.StatsCategory,
			Fields:           query.StatsFields,
			GroupBy:          query.StatsGroupBy,
			Interval:         query.StatsInterval,
			Outcome:          query.StatsOutcome,
			Reason:           query.StatsReason,
		})
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame, err := ConvertStatsV2ResponseToFrame(GetFrameName("Stats", backendQuery.RefID), stats)
		if err != nil {
			return GetErrorResponse(response, executedQueryString, err)
		}
		frame = UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
		response.Frames = append(response.Frames, frame)
	default:
		response.Error = ErrorUnknownQueryType
	}
	return response
}
