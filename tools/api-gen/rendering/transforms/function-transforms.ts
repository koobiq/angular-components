/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FunctionEntry} from '../entities.ts';
import {FunctionEntryRenderable} from '../entities/renderables.ts';
import {addRenderableCodeToc} from './code-transforms.ts';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.ts';
import {addModuleName} from './module-name.ts';
import {addRenderableFunctionParams} from './params-transforms.ts';

/** Given an unprocessed function entry, get the fully renderable function entry. */
export function getFunctionRenderable(
  entry: FunctionEntry,
  moduleName: string,
): FunctionEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addRenderableFunctionParams(
        addHtmlAdditionalLinks(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))),
          ),
        ),
      ),
    ),
  );
}
