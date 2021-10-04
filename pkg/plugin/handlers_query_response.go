package plugin

import (
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func GetFrameName(frameName string, refID string) string {
	return fmt.Sprintf("%s (%s)", frameName, refID)
}

func UpdateFrameMeta(frame *data.Frame, executedQueryString string) *data.Frame {
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: executedQueryString,
	}
	return frame
}

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
