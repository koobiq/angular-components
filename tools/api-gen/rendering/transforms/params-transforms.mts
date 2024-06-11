import {HasParams, HasRenderableParams} from '../entities/traits.mjs';
import {addHtmlDescription} from './jsdoc-transforms.mjs';
import { ParameterEntry } from '../entities.mjs';

export function addRenderableFunctionParams<T extends HasParams>(
  entry: T,
): T & HasRenderableParams {
  const params = entry.params.map((entry: ParameterEntry) => addHtmlDescription(entry));

  return {
    ...entry,
    params,
  };
}
