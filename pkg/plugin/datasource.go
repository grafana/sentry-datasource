package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
)

type SentryDatasource struct {
	IM instancemgmt.InstanceManager
}

func (ds *SentryDatasource) getDatasourceInstance(ctx context.Context, pluginCtx backend.PluginContext) (*SentryPlugin, error) {
	s, err := ds.IM.Get(pluginCtx)
	if err != nil {
		return nil, err
	}
	return s.(*SentryPlugin), nil
}

func (ds *SentryDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	_, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: SuccessfulHealthCheckMessage,
	}, nil
}

func (ds *SentryDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	_, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		response.Responses["error"] = backend.DataResponse{Error: err}
		return response, nil
	}
	for _, q := range req.Queries {
		res := ds.query(ctx, req.PluginContext, q)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func (ds *SentryDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery) backend.DataResponse {
	_, err := GetQuery(query)
	if err != nil {
		return backend.DataResponse{Error: err}
	}
	return backend.DataResponse{Error: ErrorQueryDataNotImplemented}
}

func (ds *SentryDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	_, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		return nil
	}
	return ErrorCallResourceNotImplemented
}
