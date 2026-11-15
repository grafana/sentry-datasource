import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EventsEditor, SpansEditor, UptimeEditor } from './EventsEditor';
import { selectors } from '../../selectors';
import type { SentryEventsQuery, SentrySpansQuery, SentryUptimeQuery } from '../../types';
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

const getMockSentryDataSource = (): SentryDataSource => {
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
  sentryDs.getAttributes = jest.fn(() => Promise.resolve([]));
  return sentryDs;
};

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
    const result = render(
      <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    expect(result.container.firstChild).not.toBeNull();
  });
  it('should render the dataset selector for events queries', () => {
    const query = {
      queryType: 'events',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      refId: 'A',
    } as SentryEventsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(
      <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    expect(result.getByText(selectors.components.QueryEditor.Events.Dataset.label)).toBeInTheDocument();
  });
  it('should update the query and run it when a dataset is selected', async () => {
    const query = {
      queryType: 'events',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      eventsFields: ['id'],
      refId: 'A',
    } as SentryEventsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(
      <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    await userEvent.click(screen.getAllByText(selectors.components.QueryEditor.Events.Dataset.placeholder)[0]);
    await userEvent.click(screen.getByText('errors'));
    expect(onChange).toHaveBeenCalledWith({ ...query, eventsDataset: 'errors' });
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should set the dataset to undefined and run the query when the selection is cleared', async () => {
    const query = {
      queryType: 'events',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      eventsFields: ['id'],
      eventsDataset: 'errors',
      refId: 'A',
    } as SentryEventsQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(
      <EventsEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    // comboboxes render in order: fields, dataset, sort
    const datasetInput = screen.getAllByRole('combobox')[1];
    await userEvent.click(datasetInput);
    await userEvent.keyboard('{Backspace}');
    expect(onChange).toHaveBeenCalledWith({ ...query, eventsDataset: undefined });
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should not render the dataset selector for spans queries', () => {
    const query = {
      queryType: 'spans',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      refId: 'A',
    } as SentrySpansQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(
      <SpansEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    expect(result.queryByText(selectors.components.QueryEditor.Events.Dataset.label)).not.toBeInTheDocument();
  });
});

describe('UptimeEditor', () => {
  it('should apply the uptime default fields to a new query and run it', () => {
    const query = {
      queryType: 'uptime',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      refId: 'A',
    } as SentryUptimeQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(
      <UptimeEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    expect(result.container.firstChild).not.toBeNull();
    expect(onChange).toHaveBeenCalledWith({
      ...query,
      eventsFields: ['uptime_rule', 'check_status', 'http_status_code', 'duration_ms', 'region', 'timestamp'],
    });
    expect(onRunQuery).toHaveBeenCalled();
  });
  it('should not render the dataset selector for uptime queries', () => {
    const query = {
      queryType: 'uptime',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      eventsFields: ['check_status'],
      refId: 'A',
    } as SentryUptimeQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    const result = render(
      <UptimeEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    expect(result.queryByText(selectors.components.QueryEditor.Events.Dataset.label)).not.toBeInTheDocument();
  });
  it('should offer field-based sorts instead of aggregate sorts', async () => {
    const query = {
      queryType: 'uptime',
      projectIds: [],
      environments: [],
      eventsQuery: '',
      eventsFields: ['check_status'],
      refId: 'A',
    } as SentryUptimeQuery;
    const onChange = jest.fn();
    const onRunQuery = jest.fn();
    render(
      <UptimeEditor query={query} onChange={onChange} onRunQuery={onRunQuery} datasource={getMockSentryDataSource()} />
    );
    await userEvent.click(screen.getByText(selectors.components.QueryEditor.Events.Sort.placeholder));
    expect(screen.getByText('Timestamp')).toBeInTheDocument();
    expect(screen.getByText('Duration')).toBeInTheDocument();
    expect(screen.queryByText('Events per minute')).not.toBeInTheDocument();
  });
});
