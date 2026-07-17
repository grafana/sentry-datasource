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
	for _, attributeType := range []string{"string", "number"} {
		params := url.Values{}
		params.Set("attributeType", attributeType)
		params.Set("itemType", "spans")
		urlPath := "/api/0/organizations/" + organizationSlug + "/trace-items/attributes/?" + params.Encode()

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
		} else {
			batch := []SentryAttribute{}
			if err := sc.Fetch(urlPath, &batch); err != nil {
				return nil, err
			}
			attributes = append(attributes, batch...)
		}
	}
	return attributes, nil
}
