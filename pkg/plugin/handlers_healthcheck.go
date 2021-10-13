package plugin

import (
	"context"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

func (ds *SentryDatasource) CheckHealth(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	dsi, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: err.Error(),
		}, nil
	}
	return CheckHealth(dsi.sentryClient)
}

func CheckHealth(sentryClient sentry.SentryClient) (*backend.CheckHealthResult, error) {
	projects, err := sentryClient.GetProjects(sentryClient.OrgSlug)
	if err != nil {
		errorMessage := err.Error()
		return &backend.CheckHealthResult{
			Status:  backend.HealthStatusError,
			Message: errorMessage,
		}, nil
	}
	return &backend.CheckHealthResult{
		Status:  backend.HealthStatusOk,
		Message: fmt.Sprintf("%s. %v projects found.", SuccessfulHealthCheckMessage, len(projects)),
	}, nil
}
