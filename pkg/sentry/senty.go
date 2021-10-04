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
}

type SentryClient struct {
	BaseURL          string
	authToken        string
	sentryHttpClient HTTPClient
	apiProvider
}

func NewSentryClient(baseURL string, authToken string, doerClient doer) (*SentryClient, error) {
	client := &SentryClient{
		BaseURL:   DefaultSentryURL,
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
			errorMesage := strings.TrimSpace(fmt.Sprintf("%s %s", res.Status, err.Error()))
			return errors.New(errorMesage)
		}
		errorMesage := strings.TrimSpace(fmt.Sprintf("%s %s", res.Status, errResponse.Detail))
		return errors.New(errorMesage)
	}
	return err
}
