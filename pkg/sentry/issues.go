package sentry

import (
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type SentryIssue struct {
	ID          string    `json:"id"`
	ShortID     string    `json:"shortId"`
	Title       string    `json:"title"`
	Count       string    `json:"count"`
	UserCount   int64     `json:"userCount"`
	Status      string    `json:"status"`
	Substatus   string    `json:"substatus"`
	Level       string    `json:"level"`
	Type        string    `json:"type"`
	Platform    string    `json:"platform"`
	FirstSeen   time.Time `json:"firstSeen"`
	LastSeen    time.Time `json:"lastSeen"`
	Culprit     string    `json:"culprit"`
	HasSeen     bool      `json:"hasSeen"`
	IsUnhandled bool      `json:"isUnhandled"`
	Permalink   string    `json:"permalink"`
	IsPublic    bool      `json:"isPublic"`
	Project     struct {
		ID       string `json:"id"`
		Name     string `json:"name"`
		Slug     string `json:"slug"`
		Platform string `json:"platform"`
	} `json:"project"`
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
	// Sentry scopes the top-level firstSeen/lastSeen/count/userCount to the
	// requested start/end window and reports the whole-of-life values in the
	// lifetime object, which is what Sentry's own UI displays. Excluded from
	// the frame because its dates are copied over FirstSeen/LastSeen.
	Lifetime struct {
		Count     string    `json:"count"`
		UserCount int64     `json:"userCount"`
		FirstSeen time.Time `json:"firstSeen"`
		LastSeen  time.Time `json:"lastSeen"`
	} `json:"lifetime" frame:"-"`
	FirstSeenInRange time.Time `json:"-"`
	LastSeenInRange  time.Time `json:"-"`
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
	urlPath := fmt.Sprintf("/api/0/organizations/%s/issues/?", gii.OrganizationSlug)
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
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetIssues(gii GetIssuesInput) ([]SentryIssue, string, error) {
	out := []SentryIssue{}
	executedQueryString := gii.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	for i := range out {
		out[i].applyLifetimeDates()
	}
	return out, sc.BaseURL + executedQueryString, err
}

// applyLifetimeDates promotes the lifetime firstSeen/lastSeen to the top-level
// fields so they match what Sentry's own UI shows, keeping the window-scoped
// values available under explicit names. The zero checks retain the top-level
// values on Sentry instances that do not return a lifetime object.
func (si *SentryIssue) applyLifetimeDates() {
	si.FirstSeenInRange = si.FirstSeen
	si.LastSeenInRange = si.LastSeen
	if !si.Lifetime.FirstSeen.IsZero() {
		si.FirstSeen = si.Lifetime.FirstSeen
	}
	if !si.Lifetime.LastSeen.IsZero() {
		si.LastSeen = si.Lifetime.LastSeen
	}
}
