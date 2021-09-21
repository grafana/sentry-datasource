package plugin

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
)

type SentryPlugin struct {
	settings SentryConfig
}

func NewDatasource() datasource.ServeOpts {
	im := datasource.NewInstanceManager(getInstance)
	host := &SentryDatasource{
		IM: im,
	}
	return datasource.ServeOpts{
		CheckHealthHandler:  host,
		QueryDataHandler:    host,
		CallResourceHandler: host,
	}
}

func getInstance(s backend.DataSourceInstanceSettings) (instancemgmt.Instance, error) {
	settings, err := GetSettings(s)
	if err != nil {
		return nil, err
	}
	err = settings.Validate()
	if err != nil {
		return nil, err
	}
	return &SentryPlugin{
		settings: *settings,
	}, nil
}
