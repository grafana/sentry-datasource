package sentry_test

import (
	"testing"
	"time"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestGetSessionsInput_ToQuery(t *testing.T) {
	from := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(2024, 1, 2, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name  string
		input sentry.GetSessionsInput
		want  string
	}{
		{
			name: "minimal field-only query",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "sum(session)",
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&field=sum%28session%29&includeSeries=1&interval=60m&per_page=1&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouped query with sort and ascending order",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "sum(session)",
				GroupBy:          "release",
				Sort:             "crash_free_rate(session)",
				Order:            "asc",
				Limit:            10,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&field=sum%28session%29&groupBy=release&includeSeries=1&interval=60m&orderBy=crash_free_rate%28session%29&per_page=10&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouped query without sort falls back to field with descending order",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "count_unique(user)",
				GroupBy:          "release",
				Limit:            10,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&field=count_unique%28user%29&groupBy=release&includeSeries=1&interval=60m&orderBy=-count_unique%28user%29&per_page=10&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouped query with limit below range defaults to 5",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "sum(session)",
				GroupBy:          "release",
				Limit:            0,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&field=sum%28session%29&groupBy=release&includeSeries=1&interval=60m&orderBy=-sum%28session%29&per_page=5&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouped query with limit above range is clamped to 100",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "sum(session)",
				GroupBy:          "release",
				Limit:            200,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&field=sum%28session%29&groupBy=release&includeSeries=1&interval=60m&orderBy=-sum%28session%29&per_page=100&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "sub-minimum interval is clamped to ten seconds",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               time.Date(2024, 1, 1, 0, 5, 0, 0, time.UTC),
				Interval:         200 * time.Millisecond,
				Field:            "sum(session)",
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-01T00%3A05%3A00&field=sum%28session%29&includeSeries=1&interval=10s&per_page=1&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "interval is coarsened so the range stays within the interval budget",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               time.Date(2024, 1, 8, 0, 0, 0, 0, time.UTC),
				Interval:         5 * time.Minute,
				Field:            "sum(session)",
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-08T00%3A00%3A00&field=sum%28session%29&includeSeries=1&interval=15m&per_page=1&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "interval is capped at one day",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               time.Date(2024, 3, 1, 0, 0, 0, 0, time.UTC),
				Interval:         48 * time.Hour,
				Field:            "sum(session)",
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-03-01T00%3A00%3A00&field=sum%28session%29&includeSeries=1&interval=24h&per_page=1&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouped query limit is lowered to fit the element budget",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               time.Date(2024, 1, 8, 0, 0, 0, 0, time.UTC),
				Interval:         time.Hour,
				Field:            "sum(session)",
				GroupBy:          "release",
				Limit:            100,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-08T00%3A00%3A00&field=sum%28session%29&groupBy=release&includeSeries=1&interval=60m&orderBy=-sum%28session%29&per_page=58&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouped query over a dense range coarsens the interval and lowers the limit",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               time.Date(2024, 1, 5, 0, 0, 0, 0, time.UTC),
				Interval:         5 * time.Minute,
				Field:            "sum(session)",
				GroupBy:          "release",
				Limit:            100,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-05T00%3A00%3A00&field=sum%28session%29&groupBy=release&includeSeries=1&interval=10m&orderBy=-sum%28session%29&per_page=16&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "grouping by session.status omits orderBy and per_page",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "sum(session)",
				GroupBy:          "session.status",
				Sort:             "sum(session)",
				Order:            "asc",
				Limit:            7,
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&field=sum%28session%29&groupBy=session.status&includeSeries=1&interval=60m&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "project, environment and query values are encoded",
			input: sentry.GetSessionsInput{
				OrganizationSlug: "test-org",
				ProjectIds:       []string{"123", "", "456"},
				Environments:     []string{"prod", "dev"},
				From:             from,
				To:               to,
				Interval:         time.Hour,
				Field:            "sum(session)",
				Query:            "session.status:crashed",
			},
			want: "/api/0/organizations/test-org/sessions/?end=2024-01-02T00%3A00%3A00&environment=prod&environment=dev&field=sum%28session%29&includeSeries=1&interval=60m&per_page=1&project=123&project=456&query=session.status%3Acrashed&start=2024-01-01T00%3A00%3A00",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.input.ToQuery())
		})
	}
}
