/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {FunctionEntry} from '../entities.js';
import {FunctionEntryRenderable} from '../entities/renderables.js';
import {addRenderableCodeToc} from './code-transforms.js';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.js';
import {addModuleName} from './module-name.js';
import {addRenderableFunctionParams} from './params-transforms.js';

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
