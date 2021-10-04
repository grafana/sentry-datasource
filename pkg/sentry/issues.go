package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type SentryIssue struct {
	ID        string `json:"id"`
	ShortID   string `json:"shortId"`
	Title     string `json:"title"`
	Culprit   string `json:"culprit"`
	Permalink string `json:"permalink"`
	Level     string `json:"level"`
	Status    string `json:"status"`
	IsPublic  bool   `json:"isPublic"`
	Platform  string `json:"platform"`
	Project   struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Slug     string `json:"slug"`
		Platform string `json:"platform"`
	} `json:"project"`
	Type     string `json:"type"`
	Metadata struct {
		Value    string `json:"value"`
		Type     string `json:"type"`
		Filename string `json:"filename"`
		Function string `json:"function"`
	} `json:"metadata"`
	NumComments int64 `json:"numComments"`
	AssignedTo  struct {
		Email string `json:"email"`
		Type  string `json:"type"`
		ID    string `json:"id"`
		Name  string `json:"name"`
	} `json:"assignedTo"`
	IsBookmarked        bool `json:"isBookmarked"`
	IsSubscribed        bool `json:"isSubscribed"`
	SubscriptionDetails struct {
		Reason string `json:"reason"`
	} `json:"subscriptionDetails"`
	HasSeen     bool      `json:"hasSeen"`
	IsUnhandled bool      `json:"isUnhandled"`
	Count       string    `json:"count"`
	UserCount   int64     `json:"userCount"`
	FirstSeen   time.Time `json:"firstSeen"`
	LastSeen    time.Time `json:"lastSeen"`
	// StatusDetails struct {
	// } `json:"statusDetails"`
	// Stats struct {
	// 	Two4H [][]int64 `json:"24h"`
	// } `json:"stats"`
	// ShareID interface{} `json:"shareId"`
	// Logger  interface{} `json:"logger"`
	// Annotations []interface{} `json:"annotations"`
}

type GetIssuesInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	Query            string
	From             time.Time
	To               time.Time
	Sort             string
	Limit            int64
}

func (gii *GetIssuesInput) ToQuery() string {
	urlpath := fmt.Sprintf("/api/0/organizations/%s/issues/?", gii.OrganizationSlug)
	if gii.Limit < 1 || gii.Limit > 10000 {
		gii.Limit = 10000
	}
	params := url.Values{}
	params.Set("query", gii.Query)
	params.Set("start", gii.From.Format("2006-01-02T15:04:05"))
	params.Set("end", gii.To.Format("2006-01-02T15:04:05"))
	if gii.Sort != "" {
		params.Set("sort", gii.Sort)
	}
	params.Set("limit", strconv.FormatInt(gii.Limit, 10))
	for _, projectId := range gii.ProjectIds {
		params.Add("project", projectId)
	}
	for _, environment := range gii.Environments {
		params.Add("environment", environment)
	}
	return urlpath + params.Encode()
}

func (sc *SentryClient) GetIssues(gii GetIssuesInput) ([]SentryIssue, string, error) {
	out := []SentryIssue{}
	executedQueryString := gii.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}
