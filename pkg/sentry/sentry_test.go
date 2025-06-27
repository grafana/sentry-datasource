package sentry_test

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"strings"
	"testing"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

const (
	testBaseURL   = "https://test-sentry.io"
	testOrgSlug   = "test-org"
	testAuthToken = "test-auth-token"
)

type mockDoer struct {
	response *http.Response
	err      error
}

func (m *mockDoer) Do(req *http.Request) (*http.Response, error) {
	return m.response, m.err
}

func createMockResponse(statusCode int, body interface{}, headers map[string]string) *http.Response {
	var bodyReader io.Reader

	if body != nil {
		bodyBytes, _ := json.Marshal(body)
		bodyReader = bytes.NewReader(bodyBytes)
	} else {
		bodyReader = strings.NewReader("")
	}

	resp := &http.Response{
		StatusCode: statusCode,
		Status:     http.StatusText(statusCode),
		Body:       io.NopCloser(bodyReader),
		Header:     make(http.Header),
	}

	for key, value := range headers {
		resp.Header.Set(key, value)
	}

	return resp
}

func TestNewSentryClient(t *testing.T) {
	t.Run("creates client with provided base URL", func(t *testing.T) {
		doer := &mockDoer{}
		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)

		require.NoError(t, err)
		assert.Equal(t, testBaseURL, client.BaseURL)
		assert.Equal(t, testOrgSlug, client.OrgSlug)
	})

	t.Run("uses default base URL", func(t *testing.T) {
		doer := &mockDoer{}
		client, err := sentry.NewSentryClient("", testOrgSlug, testAuthToken, doer)

		require.NoError(t, err)
		assert.Equal(t, sentry.DefaultSentryURL, client.BaseURL)
		assert.Equal(t, testOrgSlug, client.OrgSlug)
	})
}

func TestSentryClient_Fetch(t *testing.T) {
	t.Run("successfully fetches data when", func(t *testing.T) {
		expectedData := map[string]interface{}{
			"id":   "123",
			"name": "test-project",
		}

		mockResp := createMockResponse(http.StatusOK, expectedData, nil)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result map[string]interface{}
		err = client.Fetch("/api/projects/", &result)

		require.NoError(t, err)
		assert.Equal(t, expectedData, result)
	})

	t.Run("handles HTTP error with Sentry error response", func(t *testing.T) {
		errorDetail := "Permission denied"
		sentryError := sentry.SentryErrorResponse{
			Detail: errorDetail,
		}

		mockResp := createMockResponse(http.StatusForbidden, sentryError, nil)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result map[string]interface{}
		err = client.Fetch("/api/projects/", &result)

		require.Error(t, err)
		assert.Contains(t, err.Error(), "403 Forbidden")
		assert.Contains(t, err.Error(), errorDetail)
	})
}

func TestSentryClient_FetchWithPagination(t *testing.T) {
	t.Run("successfully fetches data with no next link", func(t *testing.T) {
		expectedData := []map[string]interface{}{
			{"id": "1", "name": "project1"},
			{"id": "2", "name": "project2"},
		}

		mockResp := createMockResponse(http.StatusOK, expectedData, nil)
		doer := &mockDoer{response: mockResp}

		fullURL := testBaseURL + "/api/projects/"
		client, err := sentry.NewSentryClient(fullURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination(fullURL, &result)

		require.NoError(t, err)
		assert.Empty(t, nextURL)
		assert.Equal(t, expectedData, result)
	})

	t.Run("successfully fetches data with next link", func(t *testing.T) {
		expectedData := []map[string]interface{}{
			{"id": "1", "name": "project1"},
		}

		linkHeader := `</api/projects/?cursor=next_cursor>; rel="next"; results="true"`
		headers := map[string]string{
			"Link": linkHeader,
		}

		mockResp := createMockResponse(http.StatusOK, expectedData, headers)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination("/api/projects/", &result)

		require.NoError(t, err)
		assert.Equal(t, "/api/projects/?cursor=next_cursor", nextURL)
		assert.Equal(t, expectedData, result)
	})

	t.Run("handles pagination with results=false", func(t *testing.T) {
		expectedData := []map[string]interface{}{
			{"id": "1", "name": "project1"},
		}

		linkHeader := `</api/projects/?cursor=next_cursor>; rel="next"; results="false"`
		headers := map[string]string{
			"Link": linkHeader,
		}

		mockResp := createMockResponse(http.StatusOK, expectedData, headers)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination("/api/projects/", &result)

		require.NoError(t, err)
		assert.Empty(t, nextURL)
		assert.Equal(t, expectedData, result)
	})

	t.Run("removes hostname and scheme", func(t *testing.T) {
		expectedData := []map[string]interface{}{
			{"id": "1", "name": "project1"},
		}

		linkHeader := `<http://test-url/api/projects/?cursor=next_cursor>; rel="next"; results="true"`
		headers := map[string]string{
			"Link": linkHeader,
		}

		mockResp := createMockResponse(http.StatusOK, expectedData, headers)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination("/api/projects/", &result)

		require.NoError(t, err)
		assert.Equal(t, "/api/projects/?cursor=next_cursor", nextURL)
		assert.Equal(t, expectedData, result)
	})

	t.Run("does not return malformed URLs", func(t *testing.T) {
		expectedData := []map[string]interface{}{
			{"id": "1", "name": "project1"},
		}

		linkHeader := `<http://[test::%31%test]/>; rel="next"; results="true"`
		headers := map[string]string{
			"Link": linkHeader,
		}

		fullURL := testBaseURL + "/api/projects/"
		mockResp := createMockResponse(http.StatusOK, expectedData, headers)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination(fullURL, &result)

		require.Error(t, err)
		assert.Contains(t, err.Error(), "Error parsing next link URL:")
		assert.Empty(t, nextURL)
	})

	t.Run("handles full URL path", func(t *testing.T) {
		expectedData := []map[string]interface{}{
			{"id": "1", "name": "project1"},
		}

		linkHeader := `</api/projects/?cursor=next_cursor>; rel="next"; results="false"`
		headers := map[string]string{
			"Link": linkHeader,
		}

		fullURL := testBaseURL + "/api/projects/"
		mockResp := createMockResponse(http.StatusOK, expectedData, headers)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination(fullURL, &result)

		require.NoError(t, err)
		assert.Empty(t, nextURL)
		assert.Equal(t, expectedData, result)
	})

	t.Run("handles HTTP error with Sentry error response", func(t *testing.T) {
		errorDetail := "Project not found"
		sentryError := sentry.SentryErrorResponse{
			Detail: errorDetail,
		}

		mockResp := createMockResponse(http.StatusNotFound, sentryError, nil)
		doer := &mockDoer{response: mockResp}

		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		var result []map[string]interface{}
		nextURL, err := client.FetchWithPagination("/api/projects/", &result)

		require.Error(t, err)
		assert.Contains(t, err.Error(), "404 Not Found")
		assert.Contains(t, err.Error(), errorDetail)
		assert.Empty(t, nextURL)
	})
}
