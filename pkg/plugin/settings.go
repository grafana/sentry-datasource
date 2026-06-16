package plugin

import (
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/sentry-datasource/pkg/errors"
	"github.com/grafana/sentry-datasource/pkg/util"
)

type SentryConfig struct {
	URL           string `json:"url"`
	OrgSlug       string `json:"orgSlug"`
	TLSSkipVerify bool   `json:"tlsSkipVerify"`
	authToken     string `json:"-"`
}

func (sc *SentryConfig) Validate() error {
	if sc.URL == "" {
		return errors.ErrorInvalidSentryConfig
	}
	if sc.OrgSlug == "" {
		return errors.ErrorInvalidOrganizationSlug
	}
	if sc.authToken == "" {
		return errors.ErrorInvalidAuthToken
	}
	return nil
}

func GetSettings(s backend.DataSourceInstanceSettings) (*SentryConfig, error) {
	config := &SentryConfig{}
	if err := json.Unmarshal(s.JSONData, config); err != nil {
		backend.Logger.Error(errors.ErrorUnmarshalingSettings.Error())
		return nil, errors.ErrorUnmarshalingSettings
	}
	if config.URL == "" {
		backend.Logger.Info("applying default sentry URL", "sentry url", util.DefaultSentryURL)
		config.URL = util.DefaultSentryURL
	}
	if config.OrgSlug == "" {
		return nil, errors.ErrorInvalidOrganizationSlug
	}
	if authToken, ok := s.DecryptedSecureJSONData["authToken"]; ok {
		config.authToken = authToken
	}
	if config.authToken == "" {
		backend.Logger.Error(errors.ErrorInvalidAuthToken.Error())
		return nil, errors.ErrorInvalidAuthToken
	}
	return config, config.Validate()
}
