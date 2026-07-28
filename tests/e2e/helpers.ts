import { ExplorePage } from '@grafana/plugin-e2e';
import { APIRequestContext, Page } from '@playwright/test';

export const PLUGIN_ID = 'grafana-sentry-datasource';

// Local docker compose provisions the datasource from provisioning/datasources/sentry.yaml.
// Cloud runs (Grafana Bench against DSE2EDEV) target the managed datasource instead, so the
// UID can be overridden via DS_INSTANCE_UID (see docs/testing/cloud-e2e-testing.md in
// grafana/data-sources).
export const PROVISIONED_UID = process.env.DS_INSTANCE_UID ?? 'SENTRY1234';

// Sentry is a SaaS backend, so live-data tests use a relative time range rather than a fixed
// fixture window: the org's data is continuously generated and retention moves with the clock.
export const LIVE_RANGE = { from: 'now-7d', to: 'now' };

export function exploreUrl(query: Record<string, unknown>, uid = PROVISIONED_UID, range = LIVE_RANGE): string {
  const panes = JSON.stringify({
    sentry: {
      datasource: uid,
      queries: [{ refId: 'A', datasource: { type: PLUGIN_ID, uid }, ...query }],
      range,
    },
  });
  return `/explore?orgId=1&schemaVersion=1&panes=${encodeURIComponent(panes)}`;
}

export function queryEditorRow(page: Page) {
  // Grafana 13 renamed the query editor row test id to the prefixed e2e-selector form
  // ("data-testid Query editor row"); Grafana 12 and earlier use "query-editor-row".
  return page.getByTestId('query-editor-row').or(page.getByTestId('data-testid Query editor row'));
}

export interface DataFrameJSON {
  schema?: { name?: string; fields?: Array<{ name?: string; type?: string }> };
  data?: { values?: unknown[][] };
}

export interface QueryDataBody {
  results?: Record<string, { status?: number; frames?: DataFrameJSON[] }>;
}

// TODO: remove once @grafana/plugin-e2e exposes body reading natively.
// The body must be read inside the predicate: Chrome can evict the CDP response buffer after
// navigation, making a later response.json() call racy.
export function waitForQueryDataResponseWithBody(explorePage: ExplorePage) {
  let body: QueryDataBody | null = null;
  const responsePromise = explorePage.waitForQueryDataResponse(async (r) => {
    if (!r.ok()) {
      return false;
    }
    const b = (await r.json().catch(() => null)) as QueryDataBody | null;
    if (!b?.results) {
      return false;
    }
    body = b;
    return true;
  });
  return { responsePromise, getBody: () => body };
}

// Live-data tests only make sense when the provisioned datasource holds working Sentry
// credentials (locally these are passed to docker compose via ORG_SLUG and AUTH_TOKEN).
// Probe the health endpoint once per test and skip otherwise, so the suite still passes in
// environments without credentials, such as PR CI.
export async function sentryCredentialsConfigured(request: APIRequestContext): Promise<boolean> {
  const response = await request.get(`/api/datasources/uid/${PROVISIONED_UID}/health`);
  return response.ok();
}
