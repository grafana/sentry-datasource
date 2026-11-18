package framer

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/grafana/grafana-plugin-sdk-go/data"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

func ConvertSessionsResponseToFrame(frameName string, sessions sentry.SessionsResponse) (*data.Frame, error) {
	if len(sessions.Intervals) == 0 {
		return data.NewFrameOfFieldTypes(frameName, 0), nil
	}
	frame := data.NewFrameOfFieldTypes(frameName, len(sessions.Intervals))
	field := data.NewField("Timestamp", nil, sessions.Intervals)
	frame.Fields = append(frame.Fields, field)
	for _, group := range sessions.Groups {
		for valueName, series := range group.Series {
			array, isArray := series.([]interface{})
			if !isArray {
				return nil, fmt.Errorf("expected array, got %T", series)
			}
			field := data.NewFieldFromFieldType(data.FieldTypeNullableFloat64, len(array))
			field.Name = valueName
			for _, by := range group.By {
				float, ok := by.(float64)
				if ok {
					field.Name = strconv.FormatFloat(float, 'f', 0, 64)
				} else {
					field.Name = by.(string)
				}
			}
			for index, item := range array {
				value, ok := item.(float64)
				if ok {
					field.Set(index, &value)
				} else if item != nil {
					return nil, fmt.Errorf("expected float64 or null, got %T", item)
				}
			}
			frame.Fields = append(frame.Fields, field)
		}
	}
	return frame, nil
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

func ConvertTimeSeriesResponseToFrame(frameName string, response sentry.TimeSeriesResponse) (*data.Frame, error) {
	frame := data.NewFrameOfFieldTypes(frameName, 0)
	if len(response.TimeSeries) == 0 {
		return frame, nil
	}
	firstValues := response.TimeSeries[0].Values
	timestampField := data.NewFieldFromFieldType(data.FieldTypeTime, len(firstValues))
	timestampField.Name = "Timestamp"
	for index, value := range firstValues {
		timestampField.Set(index, time.UnixMilli(value.Timestamp))
	}
	frame.Fields = append(frame.Fields, timestampField)
	grouped := false
	axes := map[string]bool{}
	for _, series := range response.TimeSeries {
		if len(series.GroupBy) > 0 || series.Meta.IsOther || axes[series.YAxis] {
			grouped = true
		}
		axes[series.YAxis] = true
	}
	multiAxis := len(axes) > 1
	for _, series := range response.TimeSeries {
		if len(series.Values) != len(firstValues) {
			return nil, fmt.Errorf("expected %d values in series %q, got %d", len(firstValues), series.YAxis, len(series.Values))
		}
		field := data.NewFieldFromFieldType(data.FieldTypeNullableFloat64, len(series.Values))
		field.Name = getTimeSeriesFieldName(series, grouped, multiAxis)
		for index, value := range series.Values {
			field.Set(index, value.Value)
		}
		frame.Fields = append(frame.Fields, field)
	}
	return frame, nil
}

func getTimeSeriesFieldName(series sentry.TimeSeries, grouped bool, multiAxis bool) string {
	if !grouped {
		if multiAxis {
			return series.YAxis
		}
		return ""
	}
	group := "Other"
	if !series.Meta.IsOther {
		values := make([]string, len(series.GroupBy))
		for index, groupBy := range series.GroupBy {
			values[index] = formatGroupByValue(groupBy.Value)
		}
		group = strings.Join(values, ",")
		if group == "" {
			group = fmt.Sprintf("Series %d", series.Meta.Order)
		}
	}
	if multiAxis {
		return fmt.Sprintf("%s: %s", group, series.YAxis)
	}
	return group
}

func formatGroupByValue(value interface{}) string {
	switch typedValue := value.(type) {
	case string:
		return typedValue
	case float64:
		return strconv.FormatFloat(typedValue, 'f', -1, 64)
	case bool:
		return strconv.FormatBool(typedValue)
	case nil:
		return ""
	default:
		return fmt.Sprintf("%v", typedValue)
	}
}
