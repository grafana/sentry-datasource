package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

type SentryPlugin struct {
	sentryClient sentry.SentryClient
}

type SentryDatasource struct {
	IM instancemgmt.InstanceManager
}

func (ds *SentryDatasource) getDatasourceInstance(ctx context.Context, pluginCtx backend.PluginContext) (*SentryPlugin, error) {
	s, err := ds.IM.Get(ctx, pluginCtx)
	if err != nil {
		return nil, err
	}
	return s.(*SentryPlugin), nil
}

func NewDatasource() datasource.ServeOpts {
	im := datasource.NewInstanceManager(getInstance)
	host := &SentryDatasource{
		IM: im,
	}
	return datasource.ServeOpts{
		CheckHealthHandler:  host,
		QueryDataHandler:    host,
		CallResourceHandler: httpadapter.New(host.getResourceRouter()),
	}
}

func getInstance(ctx context.Context, s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := GetSettings(s)
	if err != nil {
		return nil, err
	}

	// we need this options to load the secure proxy configuration
	opt, err := s.HTTPClientOptions()
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
	return &SentryPlugin{
		sentryClient: *sc,
	}, nil
}
