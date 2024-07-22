package errors

import (
	"errors"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

var (
	ErrorQueryDataNotImplemented         = errors.New("query data not implemented")
	ErrorInvalidResourceCallQuery        = errors.New("invalid resource query")
	ErrorFailedUnmarshalingResourceQuery = errors.New("failed to unmarshal resource query")
	ErrorQueryParsingNotImplemented      = errors.New("query parsing not implemented yet")
	ErrorUnmarshalingSettings            = errors.New("error while unmarshaling settings")
	ErrorInvalidSentryConfig             = errors.New("invalid sentry configuration")
	ErrorInvalidAuthToken                = errors.New("empty or invalid auth token found")
	ErrorInvalidOrganizationSlug         = errors.New("invalid or empty organization slug")
	ErrorUnknownQueryType                = errors.New("unknown query type")
)

// GetErrorResponse returns a DataResponse with an error frame.
func GetErrorResponse(response backend.DataResponse, executedQueryString string, err error) backend.DataResponse {
	if err != nil {
		response.Error = err
		frame := data.NewFrame("Error")
		frame.Meta = &data.FrameMeta{
			ExecutedQueryString: executedQueryString,
		}
		response.Frames = append(response.Frames, frame)
		return response
	}
	return response
}
