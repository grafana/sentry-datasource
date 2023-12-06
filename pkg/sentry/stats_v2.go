package sentry

import (
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"time"
)

type StatsV2Response struct {
	Start     time.Time   `json:"start"`
	End       time.Time   `json:"end"`
	Intervals []time.Time `json:"intervals"`
	Groups    []struct {
		By struct {
			Reason   string `json:"reason"`
			Category string `json:"category"`
			Outcome  string `json:"outcome"`
		} `json:"by"`
		Totals struct {
			SumTimesSeen int64 `json:"sum(times_seen)"`
			SumQuantity  int64 `json:"sum(quantity)"`
		} `json:"totals"`
		Series struct {
			SumTimesSeen []int64 `json:"sum(times_seen)"`
			SumQuantity  []int64 `json:"sum(quantity)"`
		} `json:"series"`
	} `json:"groups"`
}

type GetStatsV2Input struct {
	OrganizationSlug string
	From             time.Time
	To               time.Time
	Interval         string
	Category         []string
	Fields           []string
	GroupBy          []string
	ProjectIds       []string
	Outcome          []string
	Reason           []string
}

func (args *GetStatsV2Input) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/stats_v2/?", args.OrganizationSlug)
	params := url.Values{}
	params.Set("start", args.From.Format("2006-01-02T15:04:05"))
	params.Set("end", args.To.Format("2006-01-02T15:04:05"))
	if args.Interval != "" {
		params.Add("interval", args.Interval)
	}
	for _, category := range args.Category {
		if category != "" {
			params.Add("category", category)
		}
	}
	for _, field := range args.Fields {
		if field != "" {
			params.Add("field", field)
		}
	}
	for _, groupBy := range args.GroupBy {
		if groupBy != "" {
			params.Add("groupBy", groupBy)
		}
	}
	for _, projectId := range args.ProjectIds {
		if projectId != "" {
			params.Add("project", projectId)
		}
	}
	for _, outcome := range args.Outcome {
		if outcome != "" {
			params.Add("outcome", outcome)
		}
	}
	for _, reason := range args.Reason {
		if reason != "" {
			params.Add("reason", reason)
		}
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetStatsV2(args GetStatsV2Input) (StatsV2Response, string, error) {
	var out StatsV2Response
	if len(args.Fields) < 1 {
		return out, "", errors.New(`at least one "field" is required`)
	}
	if len(args.Category) < 1 {
		return out, "", errors.New(`at least one "category" is required`)
	}
	if args.Interval != "" && !regexp.MustCompile(`^\d+[mhdw]$`).MatchString(args.Interval) {
		return out, "", errors.New(`"interval" should be in the format [number][unit] where unit is one of m/h/d/w`)
	}
	executedQueryString := args.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
