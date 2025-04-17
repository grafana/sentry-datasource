package plugin

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

func (ds *SentryDatasource) getResourceRouter() *mux.Router {
	router := mux.NewRouter()
	router.HandleFunc("/api/0/organizations", ds.withDatasourceHandler(GetOrganizationsHandler)).Methods("GET")
	router.HandleFunc("/api/0/organizations/{organization_slug}/projects", ds.withDatasourceHandler(GetProjectsHandler)).Methods("GET")
	router.HandleFunc("/api/0/organizations/{organization_slug}/tags", ds.withDatasourceHandler(GetTagsHandler)).Methods("GET")
	router.HandleFunc("/api/0/organizations/{organization_slug}/teams", ds.withDatasourceHandler(GetOrganizationTeamsHandler)).Methods("GET")
	router.HandleFunc("/api/0/teams/{organization_slug}/{team_slug}/projects", ds.withDatasourceHandler(GetTeamsProjectsHandler)).Methods("GET")
	router.NotFoundHandler = http.HandlerFunc(ds.withDatasourceHandler(DefaultResourceHandler))
	return router
}

func (ds *SentryDatasource) withDatasourceHandler(getHandler func(d *sentry.SentryClient) http.HandlerFunc) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		h := getHandler(&ds.client)
		h.ServeHTTP(rw, r)
	}
}

func GetOrganizationsHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		orgs, err := client.GetOrganizations()
		writeResponse(orgs, err, rw)
	}
}

func GetProjectsHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		orgSlug := mux.Vars(r)["organization_slug"]
		if orgSlug == "" {
			http.Error(rw, "invalid orgSlug", http.StatusBadRequest)
			return
		}
		orgs, err := client.GetProjects(orgSlug, true)
		writeResponse(orgs, err, rw)
	}
}

func GetTagsHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		orgSlug := mux.Vars(r)["organization_slug"]
		if orgSlug == "" {
			http.Error(rw, "invalid orgSlug", http.StatusBadRequest)
			return
		}
		orgs, err := client.GetTags(orgSlug, true)
		writeResponse(orgs, err, rw)
	}
}

func GetTeamsProjectsHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		orgSlug := mux.Vars(r)["organization_slug"]
		if orgSlug == "" {
			http.Error(rw, "invalid orgSlug", http.StatusBadRequest)
			return
		}
		teamSlug := mux.Vars(r)["team_slug"]
		if teamSlug == "" {
			http.Error(rw, "invalid teamSlug", http.StatusBadRequest)
			return
		}
		projects, err := client.GetTeamsProjects(orgSlug, teamSlug)
		writeResponse(projects, err, rw)
	}
}

func GetOrganizationTeamsHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		orgSlug := mux.Vars(r)["organization_slug"]
		if orgSlug == "" {
			http.Error(rw, "invalid orgSlug", http.StatusBadRequest)
			return
		}
		teams, err := client.ListOrganizationTeams(orgSlug, true)
		writeResponse(teams, err, rw)
	}
}

func DefaultResourceHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		http.Error(rw, "not a valid resource call", http.StatusNotImplemented)
	}
}

func writeResponse(resp interface{}, err error, rw http.ResponseWriter) {
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	b, err := json.Marshal(resp)
	if err != nil {
		http.Error(rw, err.Error(), http.StatusInternalServerError)
		return
	}
	rw.Write(b) //nolint
}
