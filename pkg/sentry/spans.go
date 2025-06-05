package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type GetSpansInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	Fields           []string
	Query            string
	From             time.Time
	To               time.Time
	Sort             string
	Limit            int64
}

func (gei *GetSpansInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/events/?", gei.OrganizationSlug)
	if gei.Limit < 1 || gei.Limit > 100 {
		gei.Limit = 100
	}
	params := url.Values{}
	params.Set("dataset", "spans")
	params.Set("useRpc", "1")
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
	for _, projectId := range gei.ProjectIds {
		params.Add("project", projectId)
	}
	for _, environment := range gei.Environments {
		params.Add("environment", environment)
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetSpans(gei GetSpansInput) ([]map[string]interface{}, string, error) {
	var out struct {
		Data []map[string]interface{} `json:"data"`
	}
	executedQueryString := gei.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out.Data, sc.BaseURL + executedQueryString, err
}
