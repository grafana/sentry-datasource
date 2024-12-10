package util

import (
	"bytes"
	"errors"
	"io"
	"net/http"

	"github.com/grafana/sentry-datasource/pkg/sentry"
)

const fakeSentryUrl string = "https://foo.com"
const fakeSentryOrg string = "foo"
const fakeSentryAuthToken string = "fake-token"
const fakeResponseBody string = "{}"

type FakeDoer struct {
	Body               string
	AuthToken          string
	ExpectedError      error
	ExpectedStatusCode int
	ExpectedStatus     string
}

func (fd *FakeDoer) Do(req *http.Request) (*http.Response, error) {
	res := &http.Response{
		StatusCode: http.StatusOK,
		Status:     "200 OK",
		Body:       io.NopCloser(bytes.NewBufferString(fakeResponseBody)),
	}
	if fd.AuthToken != "" && fd.AuthToken != fakeSentryAuthToken {
		res.StatusCode = 401
		res.Status = "401 Unauthorized"
		return res, nil
	}
	if fd.ExpectedStatusCode > 0 {
		res.StatusCode = fd.ExpectedStatusCode
	}
	if fd.ExpectedStatus != "" {
		res.Status = fd.ExpectedStatus
	}
	if fd.ExpectedError != nil {
		return nil, fd.ExpectedError
	}
	if fd.Body != "" {
		res.Body = io.NopCloser(bytes.NewBufferString(fd.Body))
	}
	if res.Body != nil {
		return res, nil
	}
	return nil, errors.New("fake client not implemented")
}

func NewFakeClient(props FakeDoer) *sentry.SentryClient {
	sc, _ := sentry.NewSentryClient(fakeSentryUrl, fakeSentryOrg, fakeSentryAuthToken, &props)
	return sc
}
