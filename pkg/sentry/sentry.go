package sentry

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/build"
)

type apiProvider interface {
	// Fetch is general purpose api
	Fetch(path string, out interface{}) error

	// GetOrganizations list the organizations
	// https://docs.sentry.io/api/organizations/list-your-organizations/
	GetOrganizations() ([]SentryOrganization, error)

	// GetProjects List an Organization's Projects
	// https://docs.sentry.io/api/organizations/list-an-organizations-projects/
	GetProjects(organizationSlug string) ([]SentryProject, error)

	// GetIssues list the issues for an organization
	// Organization Slug is the mandatory parameter
	// From and To times will be grafana dashboard's range
	// https://github.com/getsentry/sentry/blob/master/src/sentry/api/endpoints/organization_group_index.py#L158
	GetIssues(gii GetIssuesInput) ([]SentryIssue, string, error)

	// GetStatsV2 list the stats for an organization
	GetStatsV2(args GetStatsV2Input) (StatsV2Response, string, error)

	// GetEvents
	// https://docs.sentry.io/api/discover/query-discover-events-in-table-format/
	// GET /api/0/organizations/{organization_slug}/events/
	GetOrgEvents(i GetOrgEventsInput) ([]map[string]interface{}, string, error)
}

type SentryClient struct {
	BaseURL          string
	OrgSlug          string
	authToken        string
	sentryHttpClient HTTPClient
	apiProvider
}

func NewSentryClient(baseURL string, orgSlug string, authToken string, doerClient doer) (*SentryClient, error) {
	client := &SentryClient{
		BaseURL:   DefaultSentryURL,
		OrgSlug:   orgSlug,
		authToken: authToken,
	}
	if baseURL != "" {
		client.BaseURL = baseURL
	}
	client.sentryHttpClient = NewHTTPClient(doerClient, PluginID, build.GetBuildInfo, client.authToken)
	return client, nil
}

type SentryErrorResponse struct {
	Detail string `json:"detail"`
}

func (sc *SentryClient) Fetch(path string, out interface{}) error {
	req, _ := http.NewRequest(http.MethodGet, sc.BaseURL+path, nil)
	res, err := sc.sentryHttpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	if res.StatusCode == http.StatusOK {
		if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
			return err
		}
	} else {
		var errResponse SentryErrorResponse
		if err := json.NewDecoder(res.Body).Decode(&errResponse); err != nil {
			errorMessage := strings.TrimSpace(fmt.Sprintf("%s %s", res.Status, err.Error()))
			return errors.New(errorMessage)
		}
		errorMessage := strings.TrimSpace(fmt.Sprintf("%s %s", res.Status, errResponse.Detail))
		return errors.New(errorMessage)
	}
	return err
}
