package query

type SentryQuery struct {
	QueryType         string   `json:"queryType"`
	ProjectIds        []string `json:"projectIds,omitempty"`
	Environments      []string `json:"environments,omitempty"`
	IssuesQuery       string   `json:"issuesQuery,omitempty"`
	IssuesSort        string   `json:"issuesSort,omitempty"`
	IssuesLimit       int64    `json:"issuesLimit,omitempty"`
	EventsQuery       string   `json:"eventsQuery,omitempty"`
	EventsSort        string   `json:"eventsSort,omitempty"`
	EventsLimit       int64    `json:"eventsLimit,omitempty"`
	EventsStatsQuery  string   `json:"eventsStatsQuery,omitempty"`
	EventsStatsYAxis  []string `json:"eventsStatsYAxis,omitempty"`
	EventsStatsGroups []string `json:"eventsStatsGroups,omitempty"`
	EventsStatsSort   string   `json:"eventsStatsSort,omitempty"`
	EventsStatsLimit  int64    `json:"eventsStatsLimit,omitempty"`
	MetricsField      string   `json:"metricsField,omitempty"`
	MetricsQuery      string   `json:"metricsQuery,omitempty"`
	MetricsGroupBy    string   `json:"metricsGroupBy,omitempty"`
	MetricsSort       string   `json:"metricsSort,omitempty"`
	MetricsOrder      string   `json:"metricsOrder,omitempty"`
	MetricsLimit      int64    `json:"metricsLimit,omitempty"`
	StatsCategory     []string `json:"statsCategory,omitempty"`
	StatsFields       []string `json:"statsFields,omitempty"`
	StatsGroupBy      []string `json:"statsGroupBy,omitempty"`
	StatsInterval     string   `json:"statsInterval,omitempty"`
	StatsOutcome      []string `json:"statsOutcome,omitempty"`
	StatsReason       []string `json:"statsReason,omitempty"`
}
