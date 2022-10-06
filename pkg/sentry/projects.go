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

func (sc *SentryClient) GetProjects(organizationSlug string) ([]SentryProject, error) {
	out := []SentryProject{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}
	err := sc.Fetch("/api/0/organizations/"+organizationSlug+"/projects/", &out)
	return out, err
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
