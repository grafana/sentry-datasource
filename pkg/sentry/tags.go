package sentry

type SentryTag struct {
	Key         string `json:"key"`
	Name        string `json:"name"`
	TotalValues int    `json:"totalValues"`
}

func (sc *SentryClient) GetTags(organizationSlug string, withPagination bool) ([]SentryTag, error) {
	tags := []SentryTag{}
	if organizationSlug == "" {
		organizationSlug = sc.OrgSlug
	}
	url := "/api/0/organizations/" + organizationSlug + "/tags/"

	if withPagination {
		for url != "" {
			batch := []SentryTag{}
			nextURL, err := sc.FetchWithPagination(url, &batch)
			if err != nil {
				return nil, err
			}

			tags = append(tags, batch...)
			url = nextURL
		}
		return tags, nil
	} else {
		err := sc.Fetch(url, &tags)
		return tags, err
	}
}
