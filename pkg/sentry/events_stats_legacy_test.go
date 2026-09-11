package sentry_test

import (
	"testing"
	"time"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestGetLegacyEventsStatsInput_ToQuery(t *testing.T) {
	from := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(2024, 1, 2, 0, 0, 0, 0, time.UTC)
	tests := []struct {
		name  string
		input sentry.GetLegacyEventsStatsInput
		want  string
	}{
		{
			name: "grouped query encodes fields, yAxis and topEvents",
			input: sentry.GetLegacyEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Fields:           []string{"count()", "release"},
				YAxis:            []string{"count()"},
				Sort:             "-count()",
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-stats/?end=2024-01-02T00%3A00%3A00Z&excludeOther=1&field=count%28%29&field=release&interval=60m&partial=1&query=&sort=-count%28%29&start=2024-01-01T00%3A00%3A00Z&topEvents=5&yAxis=count%28%29",
		},
		{
			name: "limit below range resets to ten and sort is omitted when empty",
			input: sentry.GetLegacyEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Fields:           []string{"count()", "release"},
				YAxis:            []string{"count()"},
				Limit:            0,
			},
			want: "/api/0/organizations/test-org/events-stats/?end=2024-01-02T00%3A00%3A00Z&excludeOther=1&field=count%28%29&field=release&interval=60m&partial=1&query=&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29",
		},
		{
			name: "limit above range resets to ten",
			input: sentry.GetLegacyEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Fields:           []string{"count()", "release"},
				YAxis:            []string{"count()"},
				Limit:            20,
			},
			want: "/api/0/organizations/test-org/events-stats/?end=2024-01-02T00%3A00%3A00Z&excludeOther=1&field=count%28%29&field=release&interval=60m&partial=1&query=&start=2024-01-01T00%3A00%3A00Z&topEvents=10&yAxis=count%28%29",
		},
		{
			name: "projects, environments and query are encoded",
			input: sentry.GetLegacyEventsStatsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         30 * time.Minute,
				Fields:           []string{"count()", "release"},
				YAxis:            []string{"count()"},
				Query:            "level:error",
				ProjectIds:       []string{"1", "2"},
				Environments:     []string{"prod"},
				Limit:            5,
			},
			want: "/api/0/organizations/test-org/events-stats/?end=2024-01-02T00%3A00%3A00Z&environment=prod&excludeOther=1&field=count%28%29&field=release&interval=30m&partial=1&project=1&project=2&query=level%3Aerror&start=2024-01-01T00%3A00%3A00Z&topEvents=5&yAxis=count%28%29",
		},
	}
	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			assert.Equal(t, tc.want, tc.input.ToQuery())
		})
	}
}
