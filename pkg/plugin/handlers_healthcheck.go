package plugin

import (
	"context"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

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
		Message: fmt.Sprintf("%s. %v projects found.", SuccessfulHealthCheckMessage, len(projects)),
	}, nil
}
