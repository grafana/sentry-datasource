package query

import (
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

func GetQuery(query backend.DataQuery) (SentryQuery, error) {
	var out SentryQuery
	err := json.Unmarshal(query.JSON, &out)
	return out, err
}
