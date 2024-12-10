package framer

import (
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/query"
)

type SentryEventsStatsSet struct {
	Name string
	Data []interface{}
}

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

func ExtractDataSets(namePrefix string, rawData map[string]interface{}) ([]SentryEventsStatsSet, error) {
	var sets []SentryEventsStatsSet
	for key, dataSetOrGroup := range rawData {
		if key == "data" {
			set, isArray := dataSetOrGroup.([]interface{})
			if !isArray {
				return nil, fmt.Errorf("expected array, got %T", dataSetOrGroup)
			}
			return append(sets, SentryEventsStatsSet{
				Name: namePrefix,
				Data: set,
			}), nil
		}
		if key == "order" {
			continue
		}
		child, isObject := dataSetOrGroup.(map[string]interface{})
		if !isObject {
			continue
		}
		name := key
		if len(namePrefix) != 0 && len(key) != 0 {
			name = fmt.Sprintf("%s: %s", namePrefix, key)
		}
		nestedSets, error := ExtractDataSets(name, child)
		if error != nil {
			return nil, error
		}
		sets = append(sets, nestedSets...)
	}
	return sets, nil
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
