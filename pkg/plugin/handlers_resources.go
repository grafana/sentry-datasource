package plugin

import (
	"context"
	"encoding/json"
	"net/http"
	"strings"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

type SentryResourceQueryType string

const (
	SentryResourceQueryTypeOrganization SentryResourceQueryType = "organizations"
)

type SentryResourceQuery struct {
	Type SentryResourceQueryType `json:"type"`
}

func GetResourceQuery(body []byte) (*SentryResourceQuery, error) {
	query := SentryResourceQuery{}
	if err := json.Unmarshal(body, &query); err != nil {
		return nil, ErrorFailedUnmarshalingResourceQuery
	}
	if query.Type == "" {
		return nil, ErrorInvalidResourceCallQuery
	}
	return &query, nil
}

func (ds *SentryDatasource) CallResource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	if strings.ToUpper(req.Method) == http.MethodPost {
		dsi, err := ds.getDatasourceInstance(ctx, req.PluginContext)
		if err != nil {
			return err
		}
		query, err := GetResourceQuery(req.Body)
		if err != nil {
			return err
		}
		o, err := CallResource(ctx, dsi.sentryClient, *query)
		if err != nil {
			return err
		}
		return resource.SendJSON(sender, o)
	}
	return ErrorInvalidResourceCallQuery
}

func CallResource(ctx context.Context, sentryClient sentry.SentryClient, query SentryResourceQuery) (interface{}, error) {
	if query.Type == SentryResourceQueryTypeOrganization {
		organizations, err := sentryClient.GetOrganizations()
		if err != nil {
			return nil, err
		}
		return organizations, nil
	}
	return nil, ErrorInvalidResourceCallQuery
}
