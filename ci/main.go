package main

import (
	"context"
	"fmt"
	"log"
	"os"

	"dagger.io/dagger"
)

func DownloadGrabpl(client *dagger.Client, version string) *dagger.File {
	u := fmt.Sprintf("https://grafana-downloads.storage.googleapis.com/grafana-build-pipeline/v%s/grabpl", version)
	log.Println("Downloading grabpl at", u)

	return client.Container().From("busybox").
		WithWorkdir("/").
		WithExec([]string{"wget", u}).
		WithExec([]string{"chmod", "+x", "/grabpl"}).
		File("/grabpl")
}

func Spellcheck(ctx context.Context, client dagger.Client) *dagger.Container {
	return client.Container().From("node:18-slim").
		WithDirectory("/sentry", client.Host().Directory("."), dagger.ContainerWithDirectoryOpts{Exclude: []string{".git/", "node_modules/", "dist/"}}).
		WithWorkdir("/sentry").
		WithExec([]string{"npx", "--yes", "cspell@6.13.3", "-c", "cspell.config.json", "**/*.{ts,tsx,js,go,md,mdx,yml,yaml,json,scss,css}"})
}

func BuildAndTestFrontend(ctx context.Context, container dagger.Container, cache dagger.CacheVolume, distCache dagger.CacheVolume) *dagger.Container {
	return container.WithWorkdir("/sentry").
		WithMountedCache("node_modules", &cache).
		WithMountedCache("dist", &distCache).
		WithExec([]string{"yarn", "install", "--frozen-lockfile", "--no-progress"}).
		WithExec([]string{"./node_modules/.bin/webpack", "-c", "./.config/webpack/webpack.config.ts", "--env", "production"}).
		WithExec([]string{"./node_modules/.bin/jest", "--passWithNoTests", "--maxWorkers", "4"})
}

func installMage(ctx context.Context, client dagger.Client, cache dagger.CacheVolume) *dagger.Container {
	return client.Container().From("golang:1.20").
		WithMountedCache("/go", &cache).
		WithExec([]string{"git", "clone", "https://github.com/magefile/mage"}).
		WithWorkdir("mage").
		WithExec([]string{"go", "run", "bootstrap.go"}).
		WithWorkdir("/go").
		WithExec([]string{"curl", "-sSfLO", "https://raw.githubusercontent.com/golangci/golangci-lint/master/install.sh"}).
		WithExec([]string{"chmod", "+x", "./install.sh"}).
		WithExec([]string{"./install.sh", "-b", "./bin", "v1.54.2"}).
		WithExec([]string{"go", "install", "github.com/mgechev/revive@latest"})
}

func BuildAndTestBackend(ctx context.Context, container dagger.Container, client dagger.Client, cache dagger.CacheVolume, distCache dagger.CacheVolume) *dagger.Container {
	return container.WithMountedCache("/go", &cache).
		WithDirectory("/sentry", client.Host().Directory("."), dagger.ContainerWithDirectoryOpts{Exclude: []string{".git/", "node_modules/", "dist/"}}).
		WithMountedCache("/sentry/dist", &distCache).
		WithWorkdir("/sentry").
		WithExec([]string{"golangci-lint", "run", "--timeout=5m"}).
		WithExec([]string{"mage", "-v", "coverage"}).
		WithExec([]string{"mage", "-v", "buildAll"})
}

func Package(ctx context.Context, client dagger.Client, container dagger.Container, distCache dagger.CacheVolume, grabpl *dagger.File) *dagger.Container {
	ci := client.CacheVolume("sentry_ci")

	return container.WithMountedCache("/sentry/dist-cache", &distCache).
		WithMountedCache("/sentry/ci", ci).
		WithFile("/usr/bin/grabpl", grabpl).
		WithWorkdir("/sentry").
		WithEnvVariable("GRAFANA_API_KEY", os.Getenv("GRAFANA_API_KEY")).
		WithExec([]string{"mkdir", "dist"}).
		WithExec([]string{"mkdir", "-p", "ci/jobs/package"}).
		WithExec([]string{"cp", "-r", "dist-cache", "ci/jobs/package"}).
		WithExec([]string{"grabpl", "plugin", "package"})
}

func showOutput(ctx context.Context, container dagger.Container) {
	s, err := container.Stdout(ctx)
	if err != nil {
		log.Fatal(err)
	}
	fmt.Println(s)
}

func main() {
	var grabplVersion = "2.9.51"
	ctx := context.Background()

	client, err := dagger.Connect(ctx, dagger.WithLogOutput(os.Stdout))
	if err != nil {
		log.Fatal(err)
	}

	defer client.Close()

	grabpl := DownloadGrabpl(client, grabplVersion)
	nodeCache := client.CacheVolume("sentry_node")
	goCache := client.CacheVolume("sentry_go")
	distCache := client.CacheVolume("sentry_dist")

	container := Spellcheck(ctx, *client)
	showOutput(ctx, *container)

	showOutput(ctx, *BuildAndTestFrontend(ctx, *container, *nodeCache, *distCache))

	goContainer := installMage(ctx, *client, *goCache)
	showOutput(ctx, *goContainer)

	goContainer = BuildAndTestBackend(ctx, *goContainer, *client, *goCache, *distCache)
	showOutput(ctx, *goContainer)

	// TODO: finishing packaging task for submission to catalog
	fmt.Println(grabpl) //remove when ready to package
	//output := Package(ctx, *client, *container, *distCache, grabpl)
	//showOutput(ctx, *output)
}
