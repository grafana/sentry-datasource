package plugin

import (
	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type SentryConfig struct {
}

func (sc *SentryConfig) validate() error {
	return ErrorValidateSettingsNotImplemented
}

func GetSettings(s backend.DataSourceInstanceSettings) (*SentryConfig, error) {
	return &SentryConfig{}, ErrorGetSettingsNotImplemented
}
