package plugin

import (
	"context"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func (ds *SentryDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	_, err := ds.getDatasourceInstance(ctx, req.PluginContext)
	if err != nil {
		return nil
	}
	return ErrorCallResourceNotImplemented
}
