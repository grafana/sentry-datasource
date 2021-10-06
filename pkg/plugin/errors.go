package plugin

import "errors"

var (
	ErrorQueryDataNotImplemented         = errors.New("query data not implemented")
	ErrorInvalidResourceCallQuery        = errors.New("invalid resource query")
	ErrorFailedUnmarshalingResourceQuery = errors.New("failed to unmarshal resource query")
	ErrorQueryParsingNotImplemented      = errors.New("query parsing not implemented yet")
	ErrorUnmarshalingSettings            = errors.New("error while unmarshaling settings")
	ErrorInvalidSentryConfig             = errors.New("invalid sentry configuration")
	ErrorInvalidAuthToken                = errors.New("empty or invalid auth token found")
	ErrorInvalidOrganizationSlug         = errors.New("invalid organization slug")
)
