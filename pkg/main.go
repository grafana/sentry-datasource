package main

import (
	"os"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	"github.com/grafana/grafana-plugin-sdk-go/backend/datasource"
	"github.com/grafana/sentry-datasource/pkg/plugin"
)

func main() {
	backend.SetupPluginEnvironment(plugin.PluginID)
	err := datasource.Serve(plugin.NewDatasource())
	if err != nil {
		backend.Logger.Error("error loading plugin", "pluginId", plugin.PluginID)
		os.Exit(1)
	}
}
