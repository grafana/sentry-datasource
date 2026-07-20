package sentry

import (
	"fmt"
	"math"
	"slices"
	"time"
)

var allowedSpansStatsIntervals = []int64{
	15, 30, 60, 120, 300, 600, 900, 1800, 3600, 7200, 10800, 14400, 21600, 43200, 86400,
}

const defaultSpansStatsDataPoints int64 = 800

func init() {
	slices.Sort(allowedSpansStatsIntervals)
}

func snapSpansStatsInterval(interval time.Duration, timeRange time.Duration, maxDataPoints int64) string {
	minAllowed := time.Duration(allowedSpansStatsIntervals[0]) * time.Second
	intervalSuggestion := interval

	resolvedMaxDataPoints := defaultSpansStatsDataPoints
	if maxDataPoints > 0 {
		resolvedMaxDataPoints = maxDataPoints
	}
	if interval < minAllowed || interval > timeRange {
		intervalSuggestion = timeRange / time.Duration(resolvedMaxDataPoints)
	}
	nearest := minAllowed
	for _, seconds := range allowedSpansStatsIntervals {
		valid := time.Duration(seconds) * time.Second
		if (intervalSuggestion - valid).Abs() < (intervalSuggestion - nearest).Abs() {
			nearest = valid
		}
	}
	if nearest > timeRange {
		for i := len(allowedSpansStatsIntervals) - 1; i >= 0; i-- {
			valid := time.Duration(allowedSpansStatsIntervals[i]) * time.Second
			if valid <= timeRange {
				nearest = valid
				break
			}
		}
	}
	return FormatSentryInterval(nearest)
}

func FormatSentryInterval(interval time.Duration) string {
	if interval.Hours() > 2 {
		return fmt.Sprintf("%dh", int(math.Round(interval.Hours())))
	}
	if interval.Minutes() > 2 {
		return fmt.Sprintf("%dm", int(math.Round(interval.Minutes())))
	}
	return fmt.Sprintf("%ds", int(math.Round(interval.Seconds())))
}
