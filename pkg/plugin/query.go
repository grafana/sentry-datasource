package plugin

import (
	"errors"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type SentryQuery struct {
}

func GetQuery(query backend.DataQuery) (SentryQuery, error) {
	return SentryQuery{}, errors.New("query parsing not implemented yet")
}
