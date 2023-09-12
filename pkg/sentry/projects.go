package sentry

import (
	"errors"
	"time"
)

type SentryProject struct {
	DateCreated  time.Time `json:"dateCreated"`
	HasAccess    bool      `json:"hasAccess"`
	ID           string    `json:"id"`
	IsBookmarked bool      `json:"isBookmarked"`
	IsMember     bool      `json:"isMember"`
	Environments []string  `json:"environments"`
	Name         string    `json:"name"`
	Slug         string    `json:"slug"`
	Team         struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Slug string `json:"slug"`
	} `json:"team"`
	Teams []struct {
		ID   string `json:"id"`
		Name string `json:"name"`
		Slug string `json:"slug"`
	} `json:"teams"`
}

// fetch first 100 projects
func (sc *SentryClient) GetProjects(organizationSlug string) ([]SentryProject, error) {
	out := []SentryProject{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}
	err := sc.Fetch("/api/0/organizations/"+organizationSlug+"/projects/", &out)
	return out, err
}

// Fetch all projects, checking if a link for the next page is specified in the headers
func (sc *SentryClient) GetAllProjects(organizationSlug string) ([]SentryProject, error) {
	allProjects := []SentryProject{}
	url := "/api/0/organizations/" + organizationSlug + "/projects/"

	for (url != "") {
		projects := []SentryProject{}
		nextURL, err := sc.FetchWithPagination(url, &projects)
		if err != nil {
			return nil, err
		}

		allProjects = append(allProjects, projects...)
		url = nextURL
	}

	return allProjects, nil
}

func (sc *SentryClient) GetTeamsProjects(organizationSlug string, teamSlug string) ([]SentryProject, error) {
	out := []SentryProject{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}
	if teamSlug == "" {
		return out, errors.New("invalid team slug")
	}
	err := sc.Fetch("/api/0/teams/"+organizationSlug+"/"+teamSlug+"/projects/", &out)
	return out, err
}
