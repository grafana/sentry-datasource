package framer

import (
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/query"
)

// GetFrameName returns a frame name with the refID appended in parentheses.
func GetFrameName(frameName string, refID string) string {
	return fmt.Sprintf("%s (%s)", frameName, refID)
}

// GetFrameLabels returns a slice of field names from a frame.
func GetFrameLabels(frame *data.Frame) []string {
	labels := make([]string, len(frame.Fields))
	for i := range frame.Fields {
		labels[i] = frame.Fields[i].Name
	}
	return labels
}

func UpdateFrameMeta(frame *data.Frame, executedQueryString string, query query.SentryQuery, baseURL string, orgSlug string) *data.Frame {
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
						URL:         fmt.Sprintf("%s/organizations/%s/discover/${__data.fields[\"Project\"]}:${__data.fields[\"ID\"]}/", baseURL, orgSlug),
						TargetBlank: true,
					},
				},
			}
		}
	}

	return frame
}
