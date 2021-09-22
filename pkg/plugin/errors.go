package plugin

import "errors"

var (
	ErrorQueryDataNotImplemented    = errors.New("query data not implemented")
	ErrorCallResourceNotImplemented = errors.New("call resource not implemented yet")
	ErrorQueryParsingNotImplemented = errors.New("query parsing not implemented yet")
	ErrorUnmarshalingSettings       = errors.New("error while unmarshaling settings")
	ErrorInvalidSentryConfig        = errors.New("invalid sentry configuration")
	ErrorInvalidAuthToken           = errors.New("empty or invalid auth token found")
)
