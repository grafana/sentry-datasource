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

func (sc *SentryClient) ListOrganizationTeams(organizationSlug string) ([]SentryTeam, error) {
	out := []SentryTeam{}
	err := sc.Fetch(fmt.Sprintf("/api/0/organizations/%s/teams/", organizationSlug), &out)
	return out, err
}
