package sentry

import (
	"fmt"
	"time"
)

type SentryTeam struct {
	Avatar struct {
		AvatarType string      `json:"avatarType"`
		AvatarUUID interface{} `json:"avatarUuid"`
	} `json:"avatar"`
	DateCreated time.Time     `json:"dateCreated"`
	HasAccess   bool          `json:"hasAccess"`
	ID          string        `json:"id"`
	IsMember    bool          `json:"isMember"`
	IsPending   bool          `json:"isPending"`
	MemberCount int           `json:"memberCount"`
	Name        string        `json:"name"`
	Projects    []interface{} `json:"projects"`
	Slug        string        `json:"slug"`
}

func (sc *SentryClient) ListOrganizationTeams(organizationSlug string, withPagination bool) ([]SentryTeam, error) {
	teams := []SentryTeam{}
	url := fmt.Sprintf("/api/0/organizations/%s/teams/", organizationSlug)

	if withPagination {
		for url != "" {
			batch := []SentryTeam{}
			nextURL, err := sc.FetchWithPagination(url, &batch)
			if err != nil {
				return nil, err
			}

			teams = append(teams, batch...)
			url = nextURL
		}
		return teams, nil
	} else {
		err := sc.Fetch(url, &teams)
		return teams, err
	}
}
