package plugin

import (
	"fmt"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

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

type SentryEventsStatsSet struct {
	Name string
	Data []interface{}
}

func ConvertEventStatsSetToTimestampField(set SentryEventsStatsSet) (*data.Field){
	field := data.NewFieldFromFieldType(data.FieldTypeTime, len(set.Data))
	field.Name = "Timestamp"
	for index, value := range set.Data {
		row := value.([]interface{})
		field.Set(index, time.Unix(int64(row[0].(float64)), 0))
	}
	return field
}

func ConvertEventStatsSetToField(set SentryEventsStatsSet) (*data.Field){
	field := data.NewFieldFromFieldType(data.FieldTypeNullableFloat64, len(set.Data))
	field.Name = set.Name
	for index, value := range set.Data {
		row := value.([]interface{})
		rawCount := row[1].(([]interface{}))[0].(map[string]interface{})["count"]
		count, ok := rawCount.(float64)
		if ok {
			field.Set(index, &count)
		}
	}
	return field
}

func ConvertEventsStatsResponseToFrame(frameName string, eventsStats sentry.SentryEventsStats) (*data.Frame, error) {
	sets := ExtractDataSets("", eventsStats)
	frame := data.NewFrameOfFieldTypes(frameName, 0)

	for index, set := range sets {
		if index == 0 {
			frame.Fields = append(frame.Fields, ConvertEventStatsSetToTimestampField(set))
		}
		frame.Fields = append(frame.Fields, ConvertEventStatsSetToField(set))
	}
	return frame, nil
}

func ExtractDataSets(namePrefix string, rawData map[string]interface{}) ([]SentryEventsStatsSet) {
	var sets []SentryEventsStatsSet
	for key, dataSetOrGroup := range rawData {
		if key == "data" {
			return append(sets, SentryEventsStatsSet{
				Name: namePrefix,
				Data: dataSetOrGroup.([]interface{}),
			})
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
		sets = append(sets, ExtractDataSets(name, child)...)
	}
	return sets
}