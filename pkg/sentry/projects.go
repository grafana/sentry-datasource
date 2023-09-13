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

func (sc *SentryClient) GetProjects(organizationSlug string, withPagination bool) ([]SentryProject, error) {
	projects := []SentryProject{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}	
	url := "/api/0/organizations/" + organizationSlug + "/projects/"
	
	if (withPagination) {
		for (url != "") {
			batch := []SentryProject{}
			nextURL, err := sc.FetchWithPagination(url, &batch)
			if err != nil {
				return nil, err
			}
	
			projects = append(projects, batch...)
			url = nextURL
		}
		return projects, nil
	} else {
		err := sc.Fetch(url, &projects)
		return projects, err		
	}
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
