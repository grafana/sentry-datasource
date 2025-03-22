package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type GetEventsInput struct {
	OrganizationSlug string
	ProjectId        string
	Environments     []string
	Fields           []string
	Query            string
	From             time.Time
	To               time.Time
	Sort             string
	Limit            int64
}

func (gei *GetEventsInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/projects/%s/%s/events/?", gei.OrganizationSlug, gei.ProjectId)
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
	for _, field := range gei.Fields {
		params.Add("field", field)
	}
	for _, environment := range gei.Environments {
		params.Add("environment", environment)
	}
	return urlPath + params.Encode()
}

type EventResult struct {
	Id          string            `json:"id"`
	Type        string            `json:"event.type"`
	GroupId     string            `json:"groupID"`
	EventId     string            `json:"eventID"`
	ProjectId   string            `json:"projectID"`
	Message     string            `json:"message"`
	Title       string            `json:"title"`
	User        User              `json:"user"`
	Tags        []Tag             `json:"tags"`
	Platform    string            `json:"platform"`
	DateCreated string            `json:"dateCreated"`
	Metadata    map[string]string `json:"metadata"`
}

type User struct {
	Username string `json:"username"`
}

type Tag struct {
	Key   string `json:"key"`
	Value string `json:"value"`
	Query string `json:"query"`
}

func (sc *SentryClient) GetEvents(gei GetEventsInput) ([]EventResult, string, error) {
	var eventResults []EventResult
	executedQueryString := gei.ToQuery()
	err := sc.Fetch(executedQueryString, &eventResults)
	return eventResults, sc.BaseURL + executedQueryString, err
}
