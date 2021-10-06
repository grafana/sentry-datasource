package sentry

import (
	"encoding/json"
	"errors"
	"net/http"

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
		return errors.New(res.Status)
	}
	return err
}
