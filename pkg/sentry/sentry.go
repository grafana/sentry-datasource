package sentry

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/build"
	"github.com/peterhellberg/link"	
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

func (sc *SentryClient) FetchWithPagination(path string, out interface{}) (string, error) {
	fullURL := path
	if !strings.HasPrefix(path, sc.BaseURL) {
		fullURL = sc.BaseURL + path
	}	
	req, err := http.NewRequest(http.MethodGet, fullURL, nil)
	if err != nil {
		return "", err
	}	
	res, err := sc.sentryHttpClient.Do(req)
	if err != nil {
		return "", err
	}
	defer res.Body.Close()

	nextURL := ""
	header := res.Header
	links := link.ParseHeader(header)

	if links != nil {
		if nextLink, found := links["next"]; found && nextLink.Extra["results"] == "true" {
			nextURL = nextLink.URI
		}
	}

	if res.StatusCode == http.StatusOK {
		if err := json.NewDecoder(res.Body).Decode(&out); err != nil {
			return "", err
		}
	} else {
		var errResponse SentryErrorResponse
		if err := json.NewDecoder(res.Body).Decode(&errResponse); err != nil {
			errorMessage := strings.TrimSpace(fmt.Sprintf("%s %s", res.Status, err.Error()))
			return "", errors.New(errorMessage)
		}
		errorMessage := strings.TrimSpace(fmt.Sprintf("%s %s", res.Status, errResponse.Detail))
		return "", errors.New(errorMessage)
	}
	return nextURL, nil
}

func (sc *SentryClient) Fetch(path string, out interface{}) error {
	req, err := http.NewRequest(http.MethodGet, sc.BaseURL+path, nil)
	if err != nil {
		return err
	}		
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
