package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type MetricsResponse struct {
	Start     time.Time   `json:"start"`
	End       time.Time   `json:"end"`
	Intervals []time.Time `json:"intervals"`
	Groups    []struct {
		By     map[string]interface{} `json:"by"`
		Totals map[string]interface{} `json:"totals"`
		Series map[string]interface{} `json:"series"`
	} `json:"groups"`
}

type GetMetricsInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	From             time.Time
	To               time.Time
	Interval         time.Duration
	Field            string
	Query            string
	GroupBy          string
	Sort             string
	Order            string
	Limit            int64
}

func (args *GetMetricsInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/metrics/data/?", args.OrganizationSlug)
	params := url.Values{}
	params.Set("includeSeries", "1")
	params.Set("start", args.From.Format("2006-01-02T15:04:05"))
	params.Set("end", args.To.Format("2006-01-02T15:04:05"))
	params.Set("interval", FormatSentryInterval(args.Interval))
	if args.GroupBy != "" {
		params.Add("groupBy", args.GroupBy)
		if args.GroupBy != "session.status" {
			if args.Limit < 1 || args.Limit > 10 {
				args.Limit = 5
			}
			var orderModifier = "-"
			if args.Order == "asc" {
				orderModifier = ""
			}
			if args.Sort != "" {
				params.Add("orderBy", orderModifier+args.Sort)
			} else {
				params.Add("orderBy", orderModifier+args.Field)
			}
			params.Set("per_page", strconv.FormatInt(args.Limit, 10))
		}
	} else {
		params.Set("per_page", "1")
	}
	for _, projectId := range args.ProjectIds {
		if projectId != "" {
			params.Add("project", projectId)
		}
	}
	for _, environment := range args.Environments {
		params.Add("environment", environment)
	}
	params.Add("field", args.Field)
	if args.Query != "" {
		params.Add("query", args.Query)
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetMetrics(args GetMetricsInput) (MetricsResponse, string, error) {
	var out MetricsResponse
	executedQueryString := args.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
