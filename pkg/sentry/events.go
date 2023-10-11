package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

var reqFields = [...]string{
	"id",
	"title",
	"project",
	"project.id",
	"release",
	"count()",
	"epm()",
	"last_seen()",
	"level",
	"event.type",
	"platform",
}

type SentryEvents struct {
	Data []SentryEvent          `json:"data"`
	Meta map[string]interface{} `json:"meta"`
}

type SentryEvent struct {
	ID              string    `json:"id"`
	Title           string    `json:"title"`
	Project         string    `json:"project"`
	ProjectId       int64     `json:"project.id"`
	Release         string    `json:"release"`
	Count           int64     `json:"count()"`
	EventsPerMinute float64   `json:"epm()"`
	LastSeen        time.Time `json:"last_seen()"`
	Level           string    `json:"level"`
	EventType       string    `json:"event.type"`
	Platform        string    `json:"platform"`
}

type GetEventsInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	Query            string
	From             time.Time
	To               time.Time
	Sort             string
	Limit            int64
}

func (gei *GetEventsInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/events/?", gei.OrganizationSlug)
	if gei.Limit < 1 || gei.Limit > 100 {
		gei.Limit = 100
	}
	params := url.Values{}
	params.Set("query", gei.Query)
	params.Set("start", gei.From.Format("2006-01-02T15:04:05"))
	params.Set("end", gei.To.Format("2006-01-02T15:04:05"))
	if gei.Sort != "" {
		params.Set("sort", gei.Sort)
	}
	params.Set("per_page", strconv.FormatInt(gei.Limit, 10))
	for _, field := range reqFields {
		params.Add("field", field)
	}
	for _, projectId := range gei.ProjectIds {
		params.Add("project", projectId)
	}
	for _, environment := range gei.Environments {
		params.Add("environment", environment)
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetEvents(gei GetEventsInput) ([]SentryEvent, string, error) {
	var out SentryEvents
	executedQueryString := gei.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out.Data, sc.BaseURL + executedQueryString, err
}
