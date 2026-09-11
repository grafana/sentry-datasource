package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type GetSpansStatsInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	Groups           []string
	YAxis            []string
	Query            string
	From             time.Time
	To               time.Time
	Sort             string
	Interval         time.Duration
	MaxDataPoints    int64
	Limit            int64
}

func (gei *GetSpansStatsInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/events-timeseries/?", gei.OrganizationSlug)
	params := url.Values{}
	params.Set("dataset", "spans")
	params.Set("query", gei.Query)
	params.Set("start", gei.From.Format("2006-01-02T15:04:05Z07:00"))
	params.Set("end", gei.To.Format("2006-01-02T15:04:05Z07:00"))
	seconds := int64(gei.Interval.Seconds())
	if seconds < 1 {
		seconds = 1
	}
	params.Set("interval", strconv.FormatInt(seconds, 10))
	params.Set("excludeOther", "0")
	if len(gei.Groups) > 0 {
		if gei.Limit < 1 || gei.Limit > 10 {
			gei.Limit = 10
		}
		if gei.Sort != "" {
			params.Set("sort", gei.Sort)
		}
		params.Set("topEvents", strconv.FormatInt(gei.Limit, 10))
	}
	for _, field := range gei.YAxis {
		params.Add("yAxis", field)
	}
	for _, group := range gei.Groups {
		params.Add("groupBy", group)
	}
	for _, projectId := range gei.ProjectIds {
		params.Add("project", projectId)
	}
	for _, environment := range gei.Environments {
		params.Add("environment", environment)
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetSpansStats(gei GetSpansStatsInput) (TimeSeriesResponse, string, error) {
	var out TimeSeriesResponse
	executedQueryString := gei.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
