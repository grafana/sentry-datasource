package sentry

type GetOrgEventsInput struct {
}

func (i *GetOrgEventsInput) ToQuery() string {
	return ""
}

type GetOrgEventsResponse struct {
	Data []map[string]interface{} `json:"data"`
	Meta struct {
		Fields map[string]string `json:"fields"`
	} `json:"meta"`
}

func (sc *SentryClient) GetOrgEvents(i GetOrgEventsInput) ([]map[string]interface{}, string, error) {
	response := GetOrgEventsResponse{}
	executedQueryString := i.ToQuery()
	err := sc.Fetch(executedQueryString, &response)
	if err != nil {
		return nil, executedQueryString, err
	}
	return response.Data, sc.BaseURL + executedQueryString, err
}
