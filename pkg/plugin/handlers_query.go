package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

type SentryQuery struct {
}

func GetQuery(query backend.DataQuery) (SentryQuery, error) {
	return SentryQuery{}, ErrorQueryParsingNotImplemented
}

func (ds *SentryDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	response := backend.NewQueryDataResponse()
	dsi, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		response.Responses["error"] = backend.DataResponse{Error: err}
		return response, nil
	}
	for _, q := range req.Queries {
		res := ds.query(ctx, req.PluginContext, q, dsi.sentryClient)
		response.Responses[q.RefID] = res
	}
	return response, nil
}

func (ds *SentryDatasource) query(_ context.Context, pCtx backend.PluginContext, query backend.DataQuery, client sentry.SentryClient) backend.DataResponse {
	_, err := GetQuery(query)
	if err != nil {
		return backend.DataResponse{Error: err}
	}
	return backend.DataResponse{Error: ErrorQueryDataNotImplemented}
}
