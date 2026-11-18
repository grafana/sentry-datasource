package sentry

type TimeSeriesResponse struct {
	Meta struct {
		Dataset string `json:"dataset"`
		// start and end arrive as JSON float literals, e.g. 1784167670000.0
		Start float64 `json:"start"`
		End   float64 `json:"end"`
	} `json:"meta"`
	TimeSeries []TimeSeries `json:"timeSeries"`
}

type TimeSeries struct {
	YAxis   string              `json:"yAxis"`
	GroupBy []TimeSeriesGroupBy `json:"groupBy,omitempty"`
	Values  []TimeSeriesValue   `json:"values"`
	Meta    TimeSeriesMeta      `json:"meta"`
}

type TimeSeriesGroupBy struct {
	Key   string      `json:"key"`
	Value interface{} `json:"value"`
}

type TimeSeriesValue struct {
	Timestamp  int64    `json:"timestamp"`
	Value      *float64 `json:"value"`
	Incomplete bool     `json:"incomplete"`
}

type TimeSeriesMeta struct {
	ValueType string `json:"valueType"`
	ValueUnit string `json:"valueUnit"`
	Interval  int64  `json:"interval"`
	Order     int64  `json:"order"`
	IsOther   bool   `json:"isOther"`
}
