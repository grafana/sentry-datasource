package plugin

import (
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

type SentryEventsStatsSet struct {
	Name string
	Data []interface{}
}

func ConvertStatsV2ResponseToFrame(frameName string, stats sentry.StatsV2Response) (*data.Frame, error) {
	if len(stats.Intervals) == 0 {
		return data.NewFrameOfFieldTypes(frameName, 0), nil
	}
	frame := data.NewFrameOfFieldTypes(frameName, len(stats.Intervals))
	field := data.NewField("Timestamp", nil, stats.Intervals)
	frame.Fields = append(frame.Fields, field)
	for _, group := range stats.Groups {
		if len(stats.Intervals) == len(group.Series.SumQuantity) {
			field := data.NewFieldFromFieldType(data.FieldTypeFloat64, len(group.Series.SumQuantity))
			for i, sq := range group.Series.SumQuantity {
				field.Set(i, float64(sq))
			}
			field.Name = "Sum (Quantity)"
			field.Labels = data.Labels{}
			if group.By.Category != "" {
				field.Labels["Category"] = group.By.Category
			}
			if group.By.Outcome != "" {
				field.Labels["Outcome"] = group.By.Outcome
			}
			if group.By.Reason != "" {
				field.Labels["Reason"] = group.By.Reason
			}
			frame.Fields = append(frame.Fields, field)
		}
		if len(stats.Intervals) == len(group.Series.SumTimesSeen) {
			field := data.NewFieldFromFieldType(data.FieldTypeFloat64, len(group.Series.SumTimesSeen))
			for i, ts := range group.Series.SumTimesSeen {
				field.Set(i, float64(ts))
			}
			field.Name = "Sum (Times Seen)"
			field.Labels = data.Labels{}
			if group.By.Category != "" {
				field.Labels["Category"] = group.By.Category
			}
			if group.By.Outcome != "" {
				field.Labels["Outcome"] = group.By.Outcome
			}
			if group.By.Reason != "" {
				field.Labels["Reason"] = group.By.Reason
			}
			frame.Fields = append(frame.Fields, field)
		}
	}
	return frame, nil
}

func ConvertEventStatsSetToTimestampField(set SentryEventsStatsSet) (*data.Field, error) {
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

func ConvertEventStatsSetToField(set SentryEventsStatsSet) (*data.Field, error) {
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

func ConvertEventsStatsResponseToFrame(frameName string, eventsStats sentry.SentryEventsStats) (*data.Frame, error) {
	sets, error := ExtractDataSets("", eventsStats)
	if error != nil {
		return nil, error
	}
	frame := data.NewFrameOfFieldTypes(frameName, 0)

	for index, set := range sets {
		if index == 0 {
			timestampField, error := ConvertEventStatsSetToTimestampField(set)
			if error != nil {
				return nil, error
			}
			frame.Fields = append(frame.Fields, timestampField)
		}
		field, error := ConvertEventStatsSetToField(set)
		if error != nil {
			return nil, error
		}
		frame.Fields = append(frame.Fields, field)
	}
	return frame, nil
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
