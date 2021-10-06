package sentry

import (
	"time"
)

type SentryOrganization struct {
	DateCreated    time.Time `json:"dateCreated"`
	ID             string    `json:"id"`
	IsEarlyAdopter bool      `json:"isEarlyAdopter"`
	Name           string    `json:"name"`
	Require2FA     bool      `json:"require2FA"`
	Slug           string    `json:"slug"`
	Status         struct {
		ID   string `json:"id"`
		Name string `json:"name"`
	} `json:"status"`
	Avatar struct {
		AvatarType string `json:"avatarType"`
	} `json:"avatar"`
}

func (sc *SentryClient) GetOrganizations() ([]SentryOrganization, error) {
	out := []SentryOrganization{}
	err := sc.Fetch("/api/0/organizations/", &out)
	return out, err
}
