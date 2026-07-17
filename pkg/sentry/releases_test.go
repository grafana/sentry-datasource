package sentry_test

import (
	"testing"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
)

func TestGetReleasesInput_ToQuery(t *testing.T) {
	tests := []struct {
		name  string
		input sentry.GetReleasesInput
		want  string
	}{
		{
			name: "minimal query omits the query param and defaults the limit to 100",
			input: sentry.GetReleasesInput{
				OrganizationSlug: "test-org",
			},
			want: "/api/0/organizations/test-org/releases/?per_page=100",
		},
		{
			name: "limit below range defaults to 100",
			input: sentry.GetReleasesInput{
				OrganizationSlug: "test-org",
				Limit:            0,
			},
			want: "/api/0/organizations/test-org/releases/?per_page=100",
		},
		{
			name: "limit above range is clamped to 100",
			input: sentry.GetReleasesInput{
				OrganizationSlug: "test-org",
				Limit:            500,
			},
			want: "/api/0/organizations/test-org/releases/?per_page=100",
		},
		{
			name: "limit within range is kept",
			input: sentry.GetReleasesInput{
				OrganizationSlug: "test-org",
				Limit:            50,
			},
			want: "/api/0/organizations/test-org/releases/?per_page=50",
		},
		{
			name: "project, environment and query values are encoded",
			input: sentry.GetReleasesInput{
				OrganizationSlug: "test-org",
				ProjectIds:       []string{"123", "456"},
				Environments:     []string{"prod", "dev"},
				Query:            "webapp@1",
				Limit:            50,
			},
			want: "/api/0/organizations/test-org/releases/?environment=prod&environment=dev&per_page=50&project=123&project=456&query=webapp%401",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.input.ToQuery())
		})
	}
}

func TestGetReleaseDeploysInput_ToQuery(t *testing.T) {
	tests := []struct {
		name  string
		input sentry.GetReleaseDeploysInput
		want  string
	}{
		{
			name: "plain version is kept as-is and the limit defaults to 100",
			input: sentry.GetReleaseDeploysInput{
				OrganizationSlug: "test-org",
				ReleaseVersion:   "1.0.0",
			},
			want: "/api/0/organizations/test-org/releases/1.0.0/deploys/?per_page=100",
		},
		{
			name: "version containing a slash and a space is path-escaped",
			input: sentry.GetReleaseDeploysInput{
				OrganizationSlug: "test-org",
				ReleaseVersion:   "release/1.0 beta",
			},
			want: "/api/0/organizations/test-org/releases/release%2F1.0%20beta/deploys/?per_page=100",
		},
		{
			name: "limit above range is clamped to 100",
			input: sentry.GetReleaseDeploysInput{
				OrganizationSlug: "test-org",
				ReleaseVersion:   "1.0.0",
				Limit:            500,
			},
			want: "/api/0/organizations/test-org/releases/1.0.0/deploys/?per_page=100",
		},
		{
			name: "limit within range is kept",
			input: sentry.GetReleaseDeploysInput{
				OrganizationSlug: "test-org",
				ReleaseVersion:   "1.0.0",
				Limit:            10,
			},
			want: "/api/0/organizations/test-org/releases/1.0.0/deploys/?per_page=10",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			assert.Equal(t, tt.want, tt.input.ToQuery())
		})
	}
}
