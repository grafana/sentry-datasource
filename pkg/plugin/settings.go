package plugin

import (
	"encoding/json"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
)

type SentryConfig struct {
	URL       string `json:"url"`
	OrgSlug   string `json:"orgSlug"`
	authToken string `json:"-"`
}

func (sc *SentryConfig) Validate() error {
	if sc.URL == "" {
		return ErrorInvalidSentryConfig
	}
	if sc.OrgSlug == "" {
		return ErrorInvalidOrganizationSlug
	}
	if sc.authToken == "" {
		return ErrorInvalidAuthToken
	}
	return nil
}

func GetSettings(s backend.DataSourceInstanceSettings) (*SentryConfig, error) {
	config := &SentryConfig{}
	if err := json.Unmarshal(s.JSONData, config); err != nil {
		backend.Logger.Error(ErrorUnmarshalingSettings.Error())
		return nil, ErrorUnmarshalingSettings
	}
	if config.URL == "" {
		backend.Logger.Info("applying default sentry URL", "sentry url", DefaultSentryURL)
		config.URL = DefaultSentryURL
	}
	if config.OrgSlug == "" {
		return nil, ErrorInvalidOrganizationSlug
	}
	if authToken, ok := s.DecryptedSecureJSONData["authToken"]; ok {
		config.authToken = authToken
	}
	if config.authToken == "" {
		backend.Logger.Error(ErrorInvalidAuthToken.Error())
		return nil, ErrorInvalidAuthToken
	}
	return config, config.Validate()
}
