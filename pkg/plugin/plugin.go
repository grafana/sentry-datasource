package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

type SentryDatasource struct {
	backend.CallResourceHandler
	client sentry.SentryClient
}

var (
	_ backend.QueryDataHandler      = (*SentryDatasource)(nil)
	_ backend.CheckHealthHandler    = (*SentryDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*SentryDatasource)(nil)
)

// NewDatasourceInstance creates an instance of the SentryDatasource. It is a helper
// function that is mostly used for testing.
func NewDatasourceInstance(sc *sentry.SentryClient) *SentryDatasource {
	return &SentryDatasource{
		client: *sc,
	}
}

// NewDatasource creates an instance factory for the SentryDatasource. It is consumed by
// the `datasource.Manage` function to create a new instance of the datasource.
func NewDatasource(ctx context.Context, s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := GetSettings(s)
	if err != nil {
		return nil, err
	}

	// we need these options to load the secure proxy configuration
	opt, err := s.HTTPClientOptions(ctx)
	if err != nil {
		return nil, err
	}

	hc, err := httpclient.New(opt)
	if err != nil {
		return nil, err
	}

	sc, err := sentry.NewSentryClient(settings.URL, settings.OrgSlug, settings.authToken, hc)
	if err != nil {
		return nil, err
	}

	ds := NewDatasourceInstance(sc)

	// these are used to proxy requests to Sentry
	ds.CallResourceHandler = httpadapter.New(ds.getResourceRouter())

	return ds, nil
}

func (ds *SentryDatasource) Dispose() {
}
