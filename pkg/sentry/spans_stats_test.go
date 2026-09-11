package sentry_test

import (
	"testing"
	"time"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestGetSpansStatsInput_ToQuery(t *testing.T) {
	from := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(2024, 1, 2, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name  string
		input sentry.GetSpansStatsInput
		want  string
	}{
		{
			name: "ungrouped query omits topEvents and sort",
			input: sentry.GetSpansStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         5 * time.Minute,
				YAxis:            []string{"count()"},
				Query:            "span.op:db",
				Sort:             "-count()",
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=spans&end=2024-01-02T00%3A00%3A00Z&excludeOther=0&interval=300&query=span.op%3Adb&start=2024-01-01T00%3A00%3A00Z&yAxis=count%28%29",
		},
		{
			name: "grouped query passes aggregate sort through",
			input: sentry.GetSpansStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"span.op"},
				YAxis:            []string{"count()"},
				Sort:             "-count()",
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=spans&end=2024-01-02T00%3A00%3A00Z&excludeOther=0&groupBy=span.op&interval=3600&query=&sort=-count%28%29&start=2024-01-01T00%3A00%3A00Z&topEvents=5&yAxis=count%28%29",
		},
		{
			name: "sub-second interval is clamped to one second",
			input: sentry.GetSpansStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         200 * time.Millisecond,
				YAxis:            []string{"count()"},
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=spans&end=2024-01-02T00%3A00%3A00Z&excludeOther=0&interval=1&query=&start=2024-01-01T00%3A00%3A00Z&yAxis=count%28%29",
		},
		{
			name: "grouped query with limit below range resets to 10",
			input: sentry.GetSpansStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"span.op"},
				YAxis:            []string{"count()"},
				Sort:             "-count()",
				Limit:            0,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=spans&end=2024-01-02T00%3A00%3A00Z&excludeOther=0&groupBy=span.op&interval=3600&query=&sort=-count%28%29&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29",
		},
		{
			name: "grouped query with limit above range resets to 10",
			input: sentry.GetSpansStatsInput{
				OrganizationSlug: "test-org",
				ProjectIds:       []string{"1"},
				Environments:     []string{"prod"},
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"span.op"},
				YAxis:            []string{"count()"},
				Sort:             "-count()",
				Limit:            20,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=spans&end=2024-01-02T00%3A00%3A00Z&environment=prod&excludeOther=0&groupBy=span.op&interval=3600&project=1&query=&sort=-count%28%29&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.input.ToQuery())
		})
	}
}
