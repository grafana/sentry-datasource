package plugin

import (
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/data"
)

func GetFrameName(frameName string, refID string) string {
	return fmt.Sprintf("%s (%s)", frameName, refID)
}

func UpdateFrameMeta(frame *data.Frame, executedQueryString string, query SentryQuery, baseURL string, orgSlug string) *data.Frame {
	frame.Meta = &data.FrameMeta{
		ExecutedQueryString: executedQueryString,
	}
	for i := range frame.Fields {
		if frame.Fields[i].Name == "ID" && query.QueryType == "issues" {
			frame.Fields[i].Config = &data.FieldConfig{
				Links: []data.DataLink{
					{
						Title:       "Open in Sentry",
						URL:         fmt.Sprintf("%s/organizations/%s/issues/${__data.fields[\"ID\"]}/", baseURL, orgSlug),
						TargetBlank: true,
					},
				},
			}
		}
		if frame.Fields[i].Name == "ID" && query.QueryType == "events" {
			frame.Fields[i].Config = &data.FieldConfig{
				Links: []data.DataLink{
					{
						Title:       "Open in Sentry",
						URL:         fmt.Sprintf("https://%s.sentry.io/discover/${__data.fields[\"Project\"]}:${__data.fields[\"ID\"]}/", orgSlug),
						TargetBlank: true,
					},
				},
			}
		}	
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
