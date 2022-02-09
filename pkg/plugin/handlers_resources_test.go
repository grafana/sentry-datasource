package plugin_test

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gorilla/mux"
	"github.com/grafana/sentry-datasource/pkg/plugin"
	"github.com/stretchr/testify/assert"
)

func getFakeRouter(routes map[string]func(http.ResponseWriter, *http.Request)) *mux.Router {
	router := mux.NewRouter()
	for path, handler := range routes {
		router.HandleFunc(path, handler)
	}
	return router
}

func TestGetOrganizationsHandler(t *testing.T) {
	t.Run("should return valid list of organizations", func(t *testing.T) {
		fakeOrgs := `[{"dateCreated":"0001-01-01T00:00:00Z","id":"","isEarlyAdopter":false,"name":"","require2FA":false,"slug":"","status":{"id":"","name":""},"avatar":{"avatarType":""}},{"dateCreated":"0001-01-01T00:00:00Z","id":"","isEarlyAdopter":false,"name":"","require2FA":false,"slug":"","status":{"id":"","name":""},"avatar":{"avatarType":""}},{"dateCreated":"0001-01-01T00:00:00Z","id":"","isEarlyAdopter":false,"name":"","require2FA":false,"slug":"","status":{"id":"","name":""},"avatar":{"avatarType":""}}]`
		req, _ := http.NewRequest("GET", "/api/0/organizations", nil)
		client := NewFakeClient(fakeDoer{Body: fakeOrgs})
		handler := plugin.GetOrganizationsHandler(client)
		rr := httptest.NewRecorder()
		router := getFakeRouter(map[string]func(http.ResponseWriter, *http.Request){"/api/0/organizations": handler})
		router.ServeHTTP(rr, req)
		assert.Equal(t, http.StatusOK, rr.Code)
		assert.Equal(t, fakeOrgs, rr.Body.String())
	})
}
func TestGetProjectsHandler(t *testing.T) {
	fakeProjects := "[{\"dateCreated\":\"0001-01-01T00:00:00Z\",\"hasAccess\":false,\"id\":\"\",\"isBookmarked\":false,\"isMember\":false,\"environments\":null,\"name\":\"\",\"slug\":\"\",\"team\":{\"id\":\"\",\"name\":\"\",\"slug\":\"\"},\"teams\":null},{\"dateCreated\":\"0001-01-01T00:00:00Z\",\"hasAccess\":false,\"id\":\"\",\"isBookmarked\":false,\"isMember\":false,\"environments\":null,\"name\":\"\",\"slug\":\"\",\"team\":{\"id\":\"\",\"name\":\"\",\"slug\":\"\"},\"teams\":null},{\"dateCreated\":\"0001-01-01T00:00:00Z\",\"hasAccess\":false,\"id\":\"\",\"isBookmarked\":false,\"isMember\":false,\"environments\":null,\"name\":\"\",\"slug\":\"\",\"team\":{\"id\":\"\",\"name\":\"\",\"slug\":\"\"},\"teams\":null}]"
	t.Run("valid org slug should return results", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/api/0/organizations/foo/projects", nil)
		client := NewFakeClient(fakeDoer{Body: fakeProjects})
		handler := plugin.GetProjectsHandler(client)
		rr := httptest.NewRecorder()
		router := getFakeRouter(map[string]func(http.ResponseWriter, *http.Request){"/api/0/organizations/{organization_slug}/projects": handler})
		router.ServeHTTP(rr, req)
		assert.Equal(t, http.StatusOK, rr.Code)
		assert.Equal(t, fakeProjects, rr.Body.String())
	})
}
func TestDefaultResourceHandler(t *testing.T) {
	t.Run("unknown or invalid route should throw error", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/", nil)
		client := NewFakeClient(fakeDoer{Body: ""})
		handler := plugin.DefaultResourceHandler(client)
		rr := httptest.NewRecorder()
		router := getFakeRouter(map[string]func(http.ResponseWriter, *http.Request){"/": handler})
		router.ServeHTTP(rr, req)
		assert.Equal(t, http.StatusNotImplemented, rr.Code)
		assert.Equal(t, "not a valid resource call\n", rr.Body.String())
	})
}
