import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';
import type { SentryProject } from './../types';

export const getEnvironmentNamesFromProject = (allProjects: SentryProject[], selectedProjectIds: string[]): string[] => {
  if (selectedProjectIds && selectedProjectIds.length > 0) {
    const environments: string[] = flatten(allProjects.filter((p) => selectedProjectIds.includes(p.id)).map((p) => p.environments || []));
    return uniq(environments);
  } else {
    return uniq(flatten(allProjects.map((p) => p.environments || [])));
  }
};
