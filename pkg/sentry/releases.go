package sentry

import (
	"context"
	"fmt"
	"net/url"
	"strconv"
	"time"
)

type SentryRelease struct {
	Version      string     `json:"version"`
	ShortVersion string     `json:"shortVersion"`
	DateCreated  time.Time  `json:"dateCreated"`
	DateReleased *time.Time `json:"dateReleased"`
	FirstEvent   *time.Time `json:"firstEvent"`
	LastEvent    *time.Time `json:"lastEvent"`
	CommitCount  int64      `json:"commitCount"`
	DeployCount  int64      `json:"deployCount"`
	NewGroups    int64      `json:"newGroups"`
	URL          *string    `json:"url"`
	Projects     []struct {
		Slug string `json:"slug"`
	} `json:"projects"`
}

type SentryDeploy struct {
	ID           string     `json:"id"`
	Name         *string    `json:"name"`
	Environment  string     `json:"environment"`
	DateStarted  *time.Time `json:"dateStarted"`
	DateFinished time.Time  `json:"dateFinished"`
	URL          *string    `json:"url"`
}

type GetReleasesInput struct {
	OrganizationSlug string
	ProjectIds       []string
	Environments     []string
	Query            string
	Limit            int64
}

func (gri *GetReleasesInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/releases/?", gri.OrganizationSlug)
	if gri.Limit < 1 || gri.Limit > 100 {
		gri.Limit = 100
	}
	params := url.Values{}
	if gri.Query != "" {
		params.Set("query", gri.Query)
	}
	params.Set("per_page", strconv.FormatInt(gri.Limit, 10))
	for _, projectId := range gri.ProjectIds {
		params.Add("project", projectId)
	}
	for _, environment := range gri.Environments {
		params.Add("environment", environment)
	}
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetReleases(gri GetReleasesInput) ([]SentryRelease, string, error) {
	out := []SentryRelease{}
	executedQueryString := gri.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}

type GetReleaseDeploysInput struct {
	OrganizationSlug string
	ReleaseVersion   string
	Limit            int64
}

func (grdi *GetReleaseDeploysInput) ToQuery() string {
	urlPath := fmt.Sprintf("/api/0/organizations/%s/releases/%s/deploys/?", grdi.OrganizationSlug, url.PathEscape(grdi.ReleaseVersion))
	if grdi.Limit < 1 || grdi.Limit > 100 {
		grdi.Limit = 100
	}
	params := url.Values{}
	params.Set("per_page", strconv.FormatInt(grdi.Limit, 10))
	return urlPath + params.Encode()
}

func (sc *SentryClient) GetReleaseDeploys(grdi GetReleaseDeploysInput) ([]SentryDeploy, string, error) {
	out := []SentryDeploy{}
	executedQueryString := grdi.ToQuery()
	err := sc.Fetch(executedQueryString, &out)
	return out, sc.BaseURL + executedQueryString, err
}

// listReleasesPerPage and maxListReleasesPages bound the resource call backing
// the releases template variable so it cannot page through an unbounded
// release history.
const listReleasesPerPage = 100
const maxListReleasesPages = 10

func (sc *SentryClient) ListOrganizationReleases(ctx context.Context, organizationSlug string, projectIds []string) ([]SentryRelease, error) {
	releases := []SentryRelease{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}
	params := url.Values{}
	params.Set("per_page", strconv.Itoa(listReleasesPerPage))
	for _, projectId := range projectIds {
		params.Add("project", projectId)
	}
	next := fmt.Sprintf("/api/0/organizations/%s/releases/?%s", organizationSlug, params.Encode())
	for page := 0; next != "" && page < maxListReleasesPages; page++ {
		batch := []SentryRelease{}
		nextURL, err := sc.FetchWithPaginationContext(ctx, next, &batch)
		if err != nil {
			return nil, err
		}
		releases = append(releases, batch...)
		next = nextURL
	}
	return releases, nil
}
