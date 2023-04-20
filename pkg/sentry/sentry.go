package sentry

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/build"
)

type SentryClient struct {
	BaseURL          string
	OrgSlug          string
	authToken        string
	sentryHttpClient HTTPClient
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
