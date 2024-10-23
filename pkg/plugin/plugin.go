package plugin

import (
	"context"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/httpclient"
	"github.com/grafana/grafana-plugin-sdk-go/backend/instancemgmt"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/sentry-datasource/pkg/errors"
	"github.com/grafana/sentry-datasource/pkg/handlers"
	"github.com/grafana/sentry-datasource/pkg/query"
	"github.com/grafana/sentry-datasource/pkg/sentry"
	"github.com/grafana/sentry-datasource/pkg/util"
)

var (
	_ backend.QueryDataHandler      = (*SentryDatasource)(nil)
	_ backend.CheckHealthHandler    = (*SentryDatasource)(nil)
	_ instancemgmt.InstanceDisposer = (*SentryDatasource)(nil)
)

const (
	PluginID string = "grafana-sentry-datasource"
)

// SentryDatasource is a struct that represents the Sentry datasource.
type SentryDatasource struct {
	backend.CallResourceHandler
	client sentry.SentryClient
}

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

// Dispose is a callback that is called when the datasource is being disposed.
func (ds *SentryDatasource) Dispose() {
	// this is a no-op for now
}

// QueryData is the entrypoint for handling data queries from Grafana.
func (ds *SentryDatasource) QueryData(ctx context.Context, req *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	// we don't pass a PluginContext while testing, so we need to check if it's nil
	// before logging the datasource name to avoid a panic
	if req.PluginContext.DataSourceInstanceSettings != nil {
		backend.Logger.Debug("Query", "datasource", req.PluginContext.DataSourceInstanceSettings.Name)
	}

	response := backend.NewQueryDataResponse()

	for _, q := range req.Queries {
		res := createResponse(q, ds.client)
		response.Responses[q.RefID] = res
	}

	return response, nil
}

// createResponse is a helper function that creates a response for a given query.
func createResponse(backendQuery backend.DataQuery, client sentry.SentryClient) backend.DataResponse {
	response := backend.DataResponse{}

	query, err := query.GetQuery(backendQuery)
	if err != nil {
		return errors.GetErrorResponse(response, "", err)
	}

	switch query.QueryType {
	case "issues":
		return handlers.HandleIssues(client, query, backendQuery, response)
	case "events":
		return handlers.HandleEvents(client, query, backendQuery, response)
	case "eventsStats":
		return handlers.HandleEventsStats(client, query, backendQuery, response)
	case "metrics":
		return handlers.HandleMetrics(client, query, backendQuery, response)
	case "statsV2":
		return handlers.HandleStatsV2(client, query, backendQuery, response)
	default:
		response.Error = errors.ErrorUnknownQueryType
		response.ErrorSource = backend.ErrorSourceDownstream
	}

	return response
}

// CheckHealth is a callback that is called when Grafana requests a health check for the datasource during setup.
func (ds *SentryDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	projects, err := ds.client.GetProjects(ds.client.OrgSlug, false)
	if err != nil {
		errorMessage := err.Error()
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: errorMessage,
		}, nil
	}

	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: fmt.Sprintf("%s. %v projects found.", util.SuccessfulHealthCheckMessage, len(projects)),
	}, nil
}
