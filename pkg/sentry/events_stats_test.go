package sentry_test

import (
	"testing"
	"time"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestGetEventsStatsInput_ToQuery(t *testing.T) {
	from := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(2024, 1, 2, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name  string
		input sentry.GetEventsStatsInput
		want  string
	}{
		{
			name: "ungrouped query omits topEvents and sort",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         5 * time.Minute,
				YAxis:            []string{"count()"},
				Query:            "transaction.duration:>1s",
				Sort:             "-count()",
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&excludeOther=1&interval=300&query=transaction.duration%3A%3E1s&start=2024-01-01T00%3A00%3A00Z&yAxis=count%28%29",
		},
		{
			name: "grouped query includes topEvents and sort",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"release"},
				YAxis:            []string{"count()"},
				Sort:             "-release",
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&excludeOther=1&groupBy=release&interval=3600&query=&sort=-release&start=2024-01-01T00%3A00%3A00Z&topEvents=5&yAxis=count%28%29",
		},
		{
			name: "sub-second interval is clamped to one second",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         200 * time.Millisecond,
				YAxis:            []string{"count()"},
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&excludeOther=1&interval=1&query=&start=2024-01-01T00%3A00%3A00Z&yAxis=count%28%29",
		},
		{
			name: "grouped query drops aggregate sort not present in groups",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"release"},
				YAxis:            []string{"count()"},
				Sort:             "-count()",
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&excludeOther=1&groupBy=release&interval=3600&query=&start=2024-01-01T00%3A00%3A00Z&topEvents=5&yAxis=count%28%29",
		},
		{
			name: "grouped query with limit below range resets to 10",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"release"},
				YAxis:            []string{"count()"},
				Sort:             "-release",
				Limit:            0,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&excludeOther=1&groupBy=release&interval=3600&query=&sort=-release&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29",
		},
		{
			name: "grouped query with limit above range resets to 10",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Groups:           []string{"release"},
				YAxis:            []string{"count()"},
				Sort:             "-release",
				Limit:            20,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&excludeOther=1&groupBy=release&interval=3600&query=&sort=-release&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29",
		},
		{
			name: "groups, yAxis, projects and environments are repeated",
			input: sentry.GetEventsStatsInput{
				OrganizationSlug: "test-org",
				ProjectIds:       []string{"1", "2"},
				Environments:     []string{"prod", "dev"},
				From:             from,
				To:               to,
				Interval:         time.Minute,
				Groups:           []string{"release", "environment"},
				YAxis:            []string{"count()", "count_unique(user)"},
				Sort:             "-release",
				Limit:            10,
			},
			want: "/api/0/organizations/test-org/events-timeseries/?dataset=discover&end=2024-01-02T00%3A00%3A00Z&environment=prod&environment=dev&excludeOther=1&groupBy=release&groupBy=environment&interval=60&project=1&project=2&query=&sort=-release&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29&yAxis=count_unique%28user%29",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.input.ToQuery())
		})
	}
}
