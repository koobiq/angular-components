import {DocEntry} from '../entities.mjs';

import {HasModuleName} from '../entities/traits.mjs';

export function addModuleName<T extends DocEntry>(entry: T, moduleName: string): T & HasModuleName {
  return {
    ...entry,
    moduleName,
  };
}
