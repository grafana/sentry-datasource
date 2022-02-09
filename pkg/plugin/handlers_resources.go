package plugin

import (
	"encoding/json"
	"net/http"

	"github.com/gorilla/mux"
	"github.com/grafana/grafana-plugin-sdk-go/backend/resource/httpadapter"
	"github.com/grafana/sentry-datasource/pkg/sentry"
)

func (host *SentryDatasource) getResourceRouter() *mux.Router {
	router := mux.NewRouter()
	router.HandleFunc("/api/0/organizations", host.withDatasourceHandler(GetOrganizationsHandler)).Methods("GET")
	router.HandleFunc("/api/0/organizations/{organization_slug}/projects", host.withDatasourceHandler(GetProjectsHandler)).Methods("GET")
	router.NotFoundHandler = http.HandlerFunc(host.withDatasourceHandler(DefaultResourceHandler))
	return router
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
		orgs, err := client.GetProjects(orgSlug)
		writeResponse(orgs, err, rw)
	}
}

func DefaultResourceHandler(client *sentry.SentryClient) http.HandlerFunc {
	return func(rw http.ResponseWriter, r *http.Request) {
		http.Error(rw, "not a valid resource call", http.StatusNotImplemented)
	}
}

func (host *SentryDatasource) withDatasourceHandler(getHandler func(d *sentry.SentryClient) http.HandlerFunc) func(rw http.ResponseWriter, r *http.Request) {
	return func(rw http.ResponseWriter, r *http.Request) {
		ctx := r.Context()
		pluginContext := httpadapter.PluginConfigFromContext(ctx)
		datasource, err := host.getDatasourceInstance(ctx, pluginContext)
		if err != nil {
			http.Error(rw, err.Error(), http.StatusInternalServerError)
			return
		}
		h := getHandler(&datasource.sentryClient)
		h.ServeHTTP(rw, r)
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
