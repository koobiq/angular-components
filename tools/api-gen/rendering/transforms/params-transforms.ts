/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {HasParams, HasRenderableParams} from '../entities/traits.js';
import {addHtmlDescription} from './jsdoc-transforms.js';
import { ParameterEntry } from '../entities.js';

export function addRenderableFunctionParams<T extends HasParams>(
  entry: T,
): T & HasRenderableParams {
  const params = entry.params.map((entry: ParameterEntry) => addHtmlDescription(entry));

  return {
    ...entry,
    params,
  };
}
