/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {ClassEntry} from '../entities.js';
import {ClassEntryRenderable} from '../entities/renderables.js';
import {addRenderableCodeToc} from './code-transforms.js';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.js';
import {addRenderableGroupMembers} from './member-transforms.js';
import {addModuleName} from './module-name.js';

/** Given an unprocessed class entry, get the fully renderable class entry. */
export function getClassRenderable(
  classEntry: ClassEntry,
  moduleName: string,
): ClassEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addRenderableGroupMembers(
        addHtmlAdditionalLinks(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(addHtmlDescription(addModuleName(classEntry, moduleName))),
          ),
        ),
      ),
    ),
  );
}
