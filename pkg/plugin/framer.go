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
	Data [][]interface{} `json:"data"`
}

func ConvertEventStatsSetToTimestampField(rawData interface{}) *data.Field {
	set := rawData.([]interface{})
	field := data.NewFieldFromFieldType(data.FieldTypeTime, len(set))
	field.Name = "Timestamp"
	for index, value := range set {
		row := value.([]interface{})
		field.Set(index, time.Unix(int64(row[0].(float64)), 0))
	}
	return field
}

func ConvertEventStatsSetToField(fieldName string, rawData interface{}) *data.Field {
	set := rawData.([]interface{})
	field := data.NewFieldFromFieldType(data.FieldTypeNullableFloat64, len(set))
	field.Name = fieldName
	for index, value := range set {
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
	if len(eventsStats) == 0 {
		return data.NewFrameOfFieldTypes(frameName, 0), nil
	}
	frame := data.NewFrameOfFieldTypes(frameName, 0)

	var isFirst bool = true
	for groupName, dataSetOrGroup := range eventsStats {
		dataSet := dataSetOrGroup["data"]
		if dataSet != nil {
			if isFirst {
				frame.Fields = append(frame.Fields, ConvertEventStatsSetToTimestampField(dataSet))
				isFirst = false
			}
			frame.Fields = append(frame.Fields, ConvertEventStatsSetToField(groupName, dataSet))
		} else if groupName != "order" {
			for fieldName, wrappedData := range dataSetOrGroup {
				parsed, ok := wrappedData.(map[string]interface{})
				if ok {
					dataSet := parsed["data"]
					if isFirst {
						frame.Fields = append(frame.Fields, ConvertEventStatsSetToTimestampField(dataSet))
						isFirst = false
					}
					frame.Fields = append(frame.Fields, ConvertEventStatsSetToField(fmt.Sprintf("%s: %s", groupName, fieldName), dataSet))
				}
			}
		}
	}
	return frame, nil
}
