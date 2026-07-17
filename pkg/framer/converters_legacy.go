package framer

import (
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

// Converts responses from Sentry's legacy /events-stats/ endpoint, which
// grouped Events Stats queries temporarily use while the documented
// /events-timeseries/ endpoint returns internal errors for grouped queries on
// legacy datasets. See pkg/sentry/events_stats_legacy.go for the details and
// the removal condition.

type legacyEventsStatsSet struct {
	Name string
	Data []interface{}
}

func extractLegacyDataSets(namePrefix string, rawData map[string]interface{}) ([]legacyEventsStatsSet, error) {
	var sets []legacyEventsStatsSet
	for key, dataSetOrGroup := range rawData {
		if key == "data" {
			set, isArray := dataSetOrGroup.([]interface{})
			if !isArray {
				return nil, fmt.Errorf("expected array, got %T", dataSetOrGroup)
			}
			return append(sets, legacyEventsStatsSet{
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
		nestedSets, err := extractLegacyDataSets(name, child)
		if err != nil {
			return nil, err
		}
		sets = append(sets, nestedSets...)
	}
	return sets, nil
}

func convertLegacyEventStatsSetToTimestampField(set legacyEventsStatsSet) (*data.Field, error) {
	field := data.NewFieldFromFieldType(data.FieldTypeTime, len(set.Data))
	field.Name = "Timestamp"
	for index, value := range set.Data {
		row, isArray := value.([]interface{})
		if !isArray {
			return nil, fmt.Errorf("expected array, got %T", value)
		}
		timestamp, isFloat64 := row[0].(float64)
		if !isFloat64 {
			return nil, fmt.Errorf("expected float64, got %T", row[0])
		}
		field.Set(index, time.Unix(int64(timestamp), 0))
	}
	return field, nil
}

func convertLegacyEventStatsSetToField(set legacyEventsStatsSet) (*data.Field, error) {
	field := data.NewFieldFromFieldType(data.FieldTypeNullableFloat64, len(set.Data))
	field.Name = set.Name
	for index, value := range set.Data {
		row, isArray := value.([]interface{})
		if !isArray {
			return nil, fmt.Errorf("expected array, got %T", value)
		}
		valueArray, isArray := row[1].([]interface{})
		if !isArray {
			return nil, fmt.Errorf("expected array, got %T", row[1])
		}
		valueObject, isObject := valueArray[0].(map[string]interface{})
		if !isObject {
			return nil, fmt.Errorf("expected JSON object, got %T", valueArray[0])
		}
		count, ok := valueObject["count"].(float64)
		if ok {
			field.Set(index, &count)
		} else if valueObject["count"] != nil {
			return nil, fmt.Errorf("expected float64 or null, got %T", valueObject["count"])
		}
	}
	return field, nil
}

func ConvertLegacyEventsStatsResponseToFrame(frameName string, eventsStats sentry.SentryLegacyEventsStats) (*data.Frame, error) {
	sets, err := extractLegacyDataSets("", eventsStats)
	if err != nil {
		return nil, err
	}
	frame := data.NewFrameOfFieldTypes(frameName, 0)

	for index, set := range sets {
		if index == 0 {
			timestampField, err := convertLegacyEventStatsSetToTimestampField(set)
			if err != nil {
				return nil, err
			}
			frame.Fields = append(frame.Fields, timestampField)
		}
		field, err := convertLegacyEventStatsSetToField(set)
		if err != nil {
			return nil, err
		}
		frame.Fields = append(frame.Fields, field)
	}
	return frame, nil
}
