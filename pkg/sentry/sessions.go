package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type SessionsResponse struct {
	Start     time.Time   `json:"start"`
	End       time.Time   `json:"end"`
	Intervals []time.Time `json:"intervals"`
	Groups    []struct {
		By     map[string]interface{} `json:"by"`
		Totals map[string]interface{} `json:"totals"`
		Series map[string]interface{} `json:"series"`
	} `json:"groups"`
}

type GetSessionsInput struct {
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

// The sessions endpoint rejects queries spanning more than maxSessionsIntervals
// buckets, and grouped queries whose intervals*(per_page+1) exceed maxSessionsElements.
const (
	maxSessionsIntervals = 1000
	maxSessionsElements  = 10000
)

// sessionsIntervals are the intervals the plugin may send: the sessions endpoint
// rejects intervals longer than one day, ones that do not divide a day evenly,
// and ones that are not a multiple of its ten-second minimum.
var sessionsIntervals = []time.Duration{
	10 * time.Second, 20 * time.Second, 30 * time.Second,
	time.Minute, 2 * time.Minute, 5 * time.Minute, 10 * time.Minute, 15 * time.Minute, 20 * time.Minute, 30 * time.Minute,
	time.Hour, 90 * time.Minute, 2 * time.Hour, 3 * time.Hour, 4 * time.Hour, 6 * time.Hour, 8 * time.Hour, 12 * time.Hour, 24 * time.Hour,
}

// clampSessionsInterval snaps the interval up to the nearest value the sessions
// endpoint accepts, coarsening it so the query spans at most maxIntervals buckets.
func clampSessionsInterval(interval time.Duration, from time.Time, to time.Time, maxIntervals int64) time.Duration {
	if r := to.Sub(from); r > 0 {
		if minInterval := r / time.Duration(maxIntervals-1); interval < minInterval {
			interval = minInterval
		}
	}
	for _, candidate := range sessionsIntervals {
		if candidate >= interval {
			return candidate
		}
	}
	return sessionsIntervals[len(sessionsIntervals)-1]
}

// maxSessionsLimit caps per_page so intervals*(per_page+1) stays within the
// endpoint's element budget, never dropping below the pre-3.0 cap of 10.
func maxSessionsLimit(interval time.Duration, from time.Time, to time.Time) int64 {
	numIntervals := int64(1)
	if r := to.Sub(from); r > 0 {
		numIntervals = int64(r/interval) + 1
	}
	maxLimit := int64(maxSessionsElements)/numIntervals - 1
	if maxLimit < 10 {
		maxLimit = 10
	}
	if maxLimit > 100 {
		maxLimit = 100
	}
	return maxLimit
}

func (args *GetSessionsInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/sessions/?", args.OrganizationSlug)
	maxIntervals := int64(maxSessionsIntervals)
	if args.GroupBy != "" && args.GroupBy != "session.status" {
		// leave room in the element budget for at least 10 groups plus the
		// overflow element the endpoint counts per interval
		maxIntervals = maxSessionsElements / 11
	}
	interval := clampSessionsInterval(args.Interval, args.From, args.To, maxIntervals)
	params := url.Values{}
	params.Set("includeSeries", "1")
	params.Set("start", args.From.Format("2006-01-02T15:04:05"))
	params.Set("end", args.To.Format("2006-01-02T15:04:05"))
	params.Set("interval", FormatSentryInterval(interval))
	if args.GroupBy != "" {
		params.Add("groupBy", args.GroupBy)
		if args.GroupBy != "session.status" {
			if args.Limit < 1 {
				args.Limit = 5
			}
			if maxLimit := maxSessionsLimit(interval, args.From, args.To); args.Limit > maxLimit {
				args.Limit = maxLimit
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

func (sc *SentryClient) GetSessions(args GetSessionsInput) (SessionsResponse, string, error) {
	var out SessionsResponse
	executedQueryString := args.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
