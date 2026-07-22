package sentry

import (
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"time"
)

var statsV2IntervalFormat = regexp.MustCompile(`^(\d+)([mhdw])$`)

var statsV2IntervalUnits = map[string]time.Duration{
	"m": time.Minute,
	"h": time.Hour,
	"d": 24 * time.Hour,
	"w": 7 * 24 * time.Hour,
}

// statsV2IntervalSteps holds every interval the stats_v2 endpoint accepts:
// whole-minute divisors of one day, from one minute up to one day
// (verified against the live API, 2026-07-17).
var statsV2IntervalSteps = func() []time.Duration {
	steps := []time.Duration{}
	for minutes := 1; minutes <= 24*60; minutes++ {
		if (24*60)%minutes == 0 {
			steps = append(steps, time.Duration(minutes)*time.Minute)
		}
	}
	return steps
}()

// statsV2MaxBuckets mirrors MAX_POINTS in Sentry's sessions_v2.py: the
// endpoint rejects requests whose aligned range divided by interval exceeds
// it. Sentry floors the range start and ceils the range end to interval
// boundaries first, so an unaligned range can gain one bucket on top of
// ceil(range/interval).
const statsV2MaxBuckets = 1000

func statsV2FitsBucketCap(interval time.Duration, timeRange time.Duration) bool {
	if timeRange <= 0 {
		return true
	}
	worstCaseBuckets := (timeRange+interval-1)/interval + 1
	return worstCaseBuckets <= statsV2MaxBuckets
}

func parseStatsV2Interval(interval string) (time.Duration, bool) {
	if match := statsV2IntervalFormat.FindStringSubmatch(interval); match != nil {
		count, err := strconv.Atoi(match[1])
		if err != nil || count <= 0 {
			return 0, false
		}
		return time.Duration(count) * statsV2IntervalUnits[match[2]], true
	}
	parsed, err := time.ParseDuration(interval)
	if err != nil || parsed <= 0 {
		return 0, false
	}
	return parsed, true
}

// normalizeStatsV2Interval rewrites interval values the stats_v2 endpoint
// would reject into the nearest interval it accepts. Sentry requires
// intervals between one minute and one day that divide a day without
// remainder, and rejects requests whose boundary-aligned range produces more
// than statsV2MaxBuckets buckets, so values such as the "5s" or "1m" that
// $__interval resolves to on short ranges or wide panels are snapped up
// accordingly. Intervals that already satisfy every constraint, empty values
// and values that cannot be parsed are returned unchanged.
func normalizeStatsV2Interval(interval string, from time.Time, to time.Time) string {
	if interval == "" {
		return interval
	}
	parsed, ok := parseStatsV2Interval(interval)
	if !ok {
		return interval
	}
	timeRange := to.Sub(from)
	if statsV2IntervalFormat.MatchString(interval) && parsed <= 24*time.Hour &&
		(24*time.Hour)%parsed == 0 && statsV2FitsBucketCap(parsed, timeRange) {
		return interval
	}
	for _, step := range statsV2IntervalSteps {
		if step >= parsed && statsV2FitsBucketCap(step, timeRange) {
			if step%time.Hour == 0 {
				return fmt.Sprintf("%dh", int(step.Hours()))
			}
			return fmt.Sprintf("%dm", int(step.Minutes()))
		}
	}
	return "24h"
}

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
	args.Interval = normalizeStatsV2Interval(args.Interval, args.From, args.To)
	if args.Interval != "" && !statsV2IntervalFormat.MatchString(args.Interval) {
		return out, "", errors.New(`"interval" should be in the format [number][unit] where unit is one of m/h/d/w`)
	}
	executedQueryString := args.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
