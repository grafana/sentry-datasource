import React from 'react';
import { render } from '@testing-library/react';
import { EventsEditor } from './EventsEditor';
import type { SentryEventsQuery } from '../../types';
import { SentryDataSource } from 'datasource';
import { PluginType } from '@grafana/data';
jest.mock('datasource');
jest.mock('@grafana/runtime', () => {
  const original = jest.requireActual('@grafana/runtime');
  return {
    ...original,
    getTemplateSrv: () => ({
      getVariables: () => [],
      replace: (s: string) => s,
    }),
  };
});

describe('EventsEditor', () => {
  it('should render without error', () => {
    const query = {
      queryType: 'events',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      refId: 'A',
    } as SentryEventsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const sentryDs = new SentryDataSource({
      id: 1,
      uid: '1',
      jsonData: { url: '', orgSlug: '' },
      type: 'grafana-sentry-datasource',
      name: 'Sentry',
      access: 'proxy',
      readOnly: false,
      meta: {
        id: '1',
        type: PluginType.datasource,
        name: 'Sentry',
        info: {
          version: '1.0.0',
          author: { name: 'grafana', url: '' },
          description: '',
          links: [],
          logos: { large: '', small: '' },
          screenshots: [],
          updated: '',
        },
        module: '',
        baseUrl: '',
      },
    });
    sentryDs.getTags = jest.fn(() => Promise.resolve([]));
    const result = render(
      <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={sentryDs} />
    );
    expect(result.container.firstChild).not.toBeNull();
  });
});
