package sentry_test

import (
	"net/http"
	"net/url"
	"strings"
	"testing"
	"time"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestSentryClient_GetStatsV2(t *testing.T) {
	t.Run("interval handling", func(t *testing.T) {
		from := time.Date(2026, 7, 17, 0, 0, 0, 0, time.UTC)
		tests := []struct {
			name         string
			interval     string
			timeRange    time.Duration
			offset       time.Duration
			wantInterval string
			wantErr      string
		}{
			{name: "empty interval omits the interval param", interval: "", timeRange: time.Hour},
			{name: "supported interval passes through unchanged", interval: "30m", timeRange: 24 * time.Hour, wantInterval: "30m"},
			{name: "hour interval passes through unchanged", interval: "1h", timeRange: 24 * time.Hour, wantInterval: "1h"},
			{name: "day-dividing interval outside the step ladder is kept", interval: "45m", timeRange: 24 * time.Hour, wantInterval: "45m"},
			{name: "one day interval passes through unchanged", interval: "1d", timeRange: 7 * 24 * time.Hour, wantInterval: "1d"},
			{name: "thirty second interval snaps up to one minute", interval: "30s", timeRange: time.Hour, wantInterval: "1m"},
			{name: "ten second interval snaps up to one minute", interval: "10s", timeRange: 15 * time.Minute, wantInterval: "1m"},
			{name: "millisecond interval snaps up to one minute", interval: "500ms", timeRange: time.Hour, wantInterval: "1m"},
			{name: "ninety second interval snaps up to two minutes", interval: "90s", timeRange: 6 * time.Hour, wantInterval: "2m"},
			{name: "fractional hour interval snaps up to ninety minutes", interval: "1.5h", timeRange: 7 * 24 * time.Hour, wantInterval: "90m"},
			{name: "compound duration snaps up to the next day divisor", interval: "2h30m", timeRange: 30 * 24 * time.Hour, wantInterval: "160m"},
			{name: "three and a half minutes snaps up to four minutes", interval: "3m30s", timeRange: 6 * time.Hour, wantInterval: "4m"},
			{name: "interval that does not divide a day snaps up", interval: "7m", timeRange: 6 * time.Hour, wantInterval: "8m"},
			{name: "interval below the bucket cap snaps up", interval: "1m", timeRange: 24 * time.Hour, wantInterval: "2m"},
			{name: "aligned range at exactly the bucket cap is kept", interval: "1m", timeRange: 1000 * time.Minute, wantInterval: "1m"},
			{name: "aligned range one bucket over the cap snaps up", interval: "1m", timeRange: 1001 * time.Minute, wantInterval: "2m"},
			{name: "unaligned range at the bucket cap snaps up", interval: "1m", timeRange: 1000 * time.Minute, offset: 30 * time.Second, wantInterval: "2m"},
			{name: "unaligned range just under the cap is kept", interval: "1m", timeRange: 999 * time.Minute, offset: 30 * time.Second, wantInterval: "1m"},
			{name: "interval just under the aligned bucket cap is kept", interval: "1m", timeRange: 999 * time.Minute, wantInterval: "1m"},
			{name: "hour interval over sixty days snaps up for the bucket cap", interval: "1h", timeRange: 60 * 24 * time.Hour, wantInterval: "90m"},
			{name: "multi-day interval clamps to one day", interval: "2d", timeRange: 30 * 24 * time.Hour, wantInterval: "24h"},
			{name: "week interval clamps to one day", interval: "1w", timeRange: 90 * 24 * time.Hour, wantInterval: "24h"},
			{name: "uninterpolated variable is rejected", interval: "$__interval", timeRange: time.Hour, wantErr: `"interval" should be in the format`},
			{name: "unrecognised text is rejected", interval: "hello", timeRange: time.Hour, wantErr: `"interval" should be in the format`},
			{name: "negative duration is rejected", interval: "-5m", timeRange: time.Hour, wantErr: `"interval" should be in the format`},
			{name: "zero duration is rejected", interval: "0s", timeRange: time.Hour, wantErr: `"interval" should be in the format`},
			{name: "year interval from very long ranges is rejected", interval: "1y", timeRange: 2 * 365 * 24 * time.Hour, wantErr: `"interval" should be in the format`},
		}
		for _, tc := range tests {
			t.Run(tc.name, func(t *testing.T) {
				doer := &mockDoer{response: createMockResponse(http.StatusOK, sentry.StatsV2Response{}, nil)}
				client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
				require.NoError(t, err)

				_, executedQueryString, err := client.GetStatsV2(sentry.GetStatsV2Input{
					OrganizationSlug: testOrgSlug,
					Category:         []string{"error"},
					Fields:           []string{"sum(quantity)"},
					Interval:         tc.interval,
					From:             from.Add(tc.offset),
					To:               from.Add(tc.offset + tc.timeRange),
				})

				if tc.wantErr != "" {
					require.Error(t, err)
					assert.Contains(t, err.Error(), tc.wantErr)
					return
				}
				require.NoError(t, err)
				parsed, err := url.Parse(strings.TrimPrefix(executedQueryString, testBaseURL))
				require.NoError(t, err)
				if tc.wantInterval == "" {
					assert.False(t, parsed.Query().Has("interval"), "interval param should be omitted entirely")
				} else {
					assert.Equal(t, tc.wantInterval, parsed.Query().Get("interval"))
				}
			})
		}
	})
}
