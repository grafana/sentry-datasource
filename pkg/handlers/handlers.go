package handlers

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data/framestruct"
	"github.com/grafana/sentry-datasource/pkg/errors"
	"github.com/grafana/sentry-datasource/pkg/framer"
	"github.com/grafana/sentry-datasource/pkg/query"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

// HandleIssues handles the issues query.to the Sentry API.
func HandleIssues(client sentry.SentryClient, query query.SentryQuery, backendQuery backend.DataQuery, response backend.DataResponse) backend.DataResponse {
	if client.OrgSlug == "" {
		return errors.GetErrorResponse(response, "", errors.ErrorInvalidOrganizationSlug)
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
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame, err := framestruct.ToDataFrame(framer.GetFrameName("Issues", backendQuery.RefID), issues)
	if err != nil {
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame = framer.UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
	response.Frames = append(response.Frames, frame)
	return response
}

// HandleEvents handles the events query.to the Sentry API.
func HandleEvents(client sentry.SentryClient, query query.SentryQuery, backendQuery backend.DataQuery, response backend.DataResponse) backend.DataResponse {
	if client.OrgSlug == "" {
		return errors.GetErrorResponse(response, "", errors.ErrorInvalidOrganizationSlug)
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
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame, err := framestruct.ToDataFrame(framer.GetFrameName("Events", backendQuery.RefID), events)
	if err != nil {
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame = framer.UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
	response.Frames = append(response.Frames, frame)
	return response
}

// HandleEventsStats handles the events stats query.to the Sentry API.
func HandleEventsStats(client sentry.SentryClient, query query.SentryQuery, backendQuery backend.DataQuery, response backend.DataResponse) backend.DataResponse {
	if client.OrgSlug == "" {
		return errors.GetErrorResponse(response, "", errors.ErrorInvalidOrganizationSlug)
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
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame, err := framer.ConvertEventsStatsResponseToFrame(framer.GetFrameName("EventsStats", backendQuery.RefID), eventsStats)
	if err != nil {
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame = framer.UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
	response.Frames = append(response.Frames, frame)
	return response
}

// HandleMetrics handles the metrics query.to the Sentry API.
func HandleMetrics(client sentry.SentryClient, query query.SentryQuery, backendQuery backend.DataQuery, response backend.DataResponse) backend.DataResponse {
	if client.OrgSlug == "" {
		return errors.GetErrorResponse(response, "", errors.ErrorInvalidOrganizationSlug)
	}
	metrics, executedQueryString, err := client.GetMetrics(sentry.GetMetricsInput{
		OrganizationSlug: client.OrgSlug,
		ProjectIds:       query.ProjectIds,
		Environments:     query.Environments,
		Field:            query.MetricsField,
		Query:            query.MetricsQuery,
		GroupBy:          query.MetricsGroupBy,
		Sort:             query.MetricsSort,
		Order:            query.MetricsOrder,
		Limit:            query.MetricsLimit,
		Interval:         backendQuery.Interval,
		From:             backendQuery.TimeRange.From,
		To:               backendQuery.TimeRange.To,
	})
	if err != nil {
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame, err := framer.ConvertMetricsResponseToFrame(framer.GetFrameName("Metrics", backendQuery.RefID), metrics)
	if err != nil {
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame = framer.UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
	response.Frames = append(response.Frames, frame)
	return response
}

// HandleStatsV2 handles the statsV2 query.to the Sentry API.
func HandleStatsV2(client sentry.SentryClient, query query.SentryQuery, backendQuery backend.DataQuery, response backend.DataResponse) backend.DataResponse {
	if client.OrgSlug == "" {
		return errors.GetErrorResponse(response, "", errors.ErrorInvalidOrganizationSlug)
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
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame, err := framer.ConvertStatsV2ResponseToFrame(framer.GetFrameName("Stats", backendQuery.RefID), stats)
	if err != nil {
		return errors.GetErrorResponse(response, executedQueryString, err)
	}
	frame = framer.UpdateFrameMeta(frame, executedQueryString, query, client.BaseURL, client.OrgSlug)
	response.Frames = append(response.Frames, frame)
	return response
}
