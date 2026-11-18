package sentry_test

import (
	"net/http"
	"testing"

	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

type recordingDoer struct {
	requests  []string
	responses []*http.Response
}

func (d *recordingDoer) Do(req *http.Request) (*http.Response, error) {
	d.requests = append(d.requests, req.URL.String())
	return d.responses[len(d.requests)-1], nil
}

func TestSentryClient_GetAttributes(t *testing.T) {
	t.Run("fetches both string and number attributes and merges results", func(t *testing.T) {
		doer := &recordingDoer{responses: []*http.Response{
			createMockResponse(http.StatusOK, []sentry.SentryAttribute{{Key: "span.description", Name: "span.description"}}, nil),
			createMockResponse(http.StatusOK, []sentry.SentryAttribute{{Key: "span.duration", Name: "span.duration"}}, nil),
		}}
		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		attributes, err := client.GetAttributes(testOrgSlug, false)

		require.NoError(t, err)
		assert.Equal(t, []string{
			testBaseURL + "/api/0/organizations/test-org/trace-items/attributes/?attributeType=string&itemType=spans",
			testBaseURL + "/api/0/organizations/test-org/trace-items/attributes/?attributeType=number&itemType=spans",
		}, doer.requests)
		assert.Equal(t, []sentry.SentryAttribute{
			{Key: "span.description", Name: "span.description"},
			{Key: "span.duration", Name: "span.duration"},
		}, attributes)
	})

	t.Run("follows pagination for each attribute type", func(t *testing.T) {
		linkHeader := `</api/0/organizations/test-org/trace-items/attributes/?attributeType=string&cursor=next&itemType=spans>; rel="next"; results="true"`
		doer := &recordingDoer{responses: []*http.Response{
			createMockResponse(http.StatusOK, []sentry.SentryAttribute{{Key: "span.description", Name: "span.description"}}, map[string]string{"Link": linkHeader}),
			createMockResponse(http.StatusOK, []sentry.SentryAttribute{{Key: "span.status", Name: "span.status"}}, nil),
			createMockResponse(http.StatusOK, []sentry.SentryAttribute{{Key: "span.duration", Name: "span.duration"}}, nil),
		}}
		client, err := sentry.NewSentryClient(testBaseURL, testOrgSlug, testAuthToken, doer)
		require.NoError(t, err)

		attributes, err := client.GetAttributes(testOrgSlug, true)

		require.NoError(t, err)
		assert.Equal(t, []string{
			testBaseURL + "/api/0/organizations/test-org/trace-items/attributes/?attributeType=string&itemType=spans",
			testBaseURL + "/api/0/organizations/test-org/trace-items/attributes/?attributeType=string&cursor=next&itemType=spans",
			testBaseURL + "/api/0/organizations/test-org/trace-items/attributes/?attributeType=number&itemType=spans",
		}, doer.requests)
		assert.Equal(t, []sentry.SentryAttribute{
			{Key: "span.description", Name: "span.description"},
			{Key: "span.status", Name: "span.status"},
			{Key: "span.duration", Name: "span.duration"},
		}, attributes)
	})
}
