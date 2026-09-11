package sentry_test

import (
	"testing"
	"time"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestGetEventsInput_ToQuery(t *testing.T) {
	from := time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)
	to := time.Date(2024, 1, 2, 0, 0, 0, 0, time.UTC)

	tests := []struct {
		name  string
		input sentry.GetEventsInput
		want  string
	}{
		{
			name: "query without dataset omits the dataset param",
			input: sentry.GetEventsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Fields:           []string{"id", "title"},
				Query:            "event_query",
				Sort:             "-timestamp",
				Limit:            10,
			},
			want: "/api/0/organizations/test-org/events/?end=2024-01-02T00%3A00%3A00&field=id&field=title&per_page=10&query=event_query&sort=-timestamp&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "query with dataset includes the dataset param",
			input: sentry.GetEventsInput{
				OrganizationSlug: "test-org",
				From:             from,
				To:               to,
				Fields:           []string{"id", "title"},
				Dataset:          "errors",
				Query:            "event_query",
				Sort:             "-timestamp",
				Limit:            10,
			},
			want: "/api/0/organizations/test-org/events/?dataset=errors&end=2024-01-02T00%3A00%3A00&field=id&field=title&per_page=10&query=event_query&sort=-timestamp&start=2024-01-01T00%3A00%3A00",
		},
		{
			name: "projects and environments are repeated and limit out of range resets to 100",
			input: sentry.GetEventsInput{
				OrganizationSlug: "test-org",
				ProjectIds:       []string{"1", "2"},
				Environments:     []string{"prod", "dev"},
				From:             from,
				To:               to,
				Fields:           []string{"id"},
				Dataset:          "transactions",
				Limit:            0,
			},
			want: "/api/0/organizations/test-org/events/?dataset=transactions&end=2024-01-02T00%3A00%3A00&environment=prod&environment=dev&field=id&per_page=100&project=1&project=2&query=&start=2024-01-01T00%3A00%3A00",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.input.ToQuery())
		})
	}
}
