package sentry

import "net/url"

type SentryAttribute struct {
	Key  string `json:"key"`
	Name string `json:"name"`
}

func (sc *SentryClient) GetAttributes(organizationSlug string, withPagination bool) ([]SentryAttribute, error) {
	attributes := []SentryAttribute{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}
	urlPath := "/api/0/organizations/" + organizationSlug + "/trace-items/attributes/"
	params := url.Values{}
	params.Set("attributeType", "number")
	params.Set("itemType", "spans")
	urlPath += params.Encode()

	if withPagination {
		for urlPath != "" {
			batch := []SentryAttribute{}
			nextURL, err := sc.FetchWithPagination(urlPath, &batch)
			if err != nil {
				return nil, err
			}

			attributes = append(attributes, batch...)
			urlPath = nextURL
		}
		return attributes, nil
	} else {
		err := sc.Fetch(urlPath, &attributes)
		return attributes, err
	}
}
