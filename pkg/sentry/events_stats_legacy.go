package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

// Grouped Events Stats queries temporarily use Sentry's undocumented legacy
// /events-stats/ endpoint. The documented replacement, /events-timeseries/,
// returns HTTP 500 ("Internal Error") for every grouped (topEvents) query on
// the legacy discover and errors datasets, while ungrouped queries and grouped
// queries on RPC datasets such as spans succeed. Verified live against
// sentry.io on 2026-07-17 (example error IDs 41cccfe4a6e94063816aed11153d3add
// and 2f71f4784f1b44189ebc0677875b5f52) with Sentry's status page reporting
// all systems operational. The same requests succeeded earlier that day, so
// this looks like a server-side regression rather than an intended contract
// change. Once grouped discover queries succeed on /events-timeseries/ again,
// delete this file, pkg/framer/converters_legacy.go, and the grouped branch in
// handlers.HandleEventsStats, and route grouped queries through GetEventsStats.

type SentryLegacyEventsStats = map[string]interface{}

type GetLegacyEventsStatsInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	Fields           []string
	YAxis            []string
	Query            string
	From             time.Time
	To               time.Time
	Sort             string
	Interval         time.Duration
	Limit            int64
}

func (gei *GetLegacyEventsStatsInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/events-stats/?", gei.OrganizationSlug)
	if gei.Limit < 1 || gei.Limit > 10 {
		gei.Limit = 10
	}
	params := url.Values{}
	params.Set("query", gei.Query)
	params.Set("start", gei.From.Format("2006-01-02T15:04:05Z07:00"))
	params.Set("end", gei.To.Format("2006-01-02T15:04:05Z07:00"))
	params.Set("interval", FormatSentryInterval(gei.Interval))
	params.Set("partial", "1")
	params.Set("excludeOther", "1")
	if gei.Sort != "" {
		params.Set("sort", gei.Sort)
	}
	params.Set("topEvents", strconv.FormatInt(gei.Limit, 10))
	for _, field := range gei.Fields {
		params.Add("field", field)
	}
	for _, field := range gei.YAxis {
		params.Add("yAxis", field)
	}
	for _, projectId := range gei.ProjectIds {
		params.Add("project", projectId)
	}
	for _, environment := range gei.Environments {
		params.Add("environment", environment)
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetLegacyEventsStats(gei GetLegacyEventsStatsInput) (SentryLegacyEventsStats, string, error) {
	var out SentryLegacyEventsStats
	executedQueryString := gei.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
