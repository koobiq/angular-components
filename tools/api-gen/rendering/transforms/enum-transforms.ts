/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnumEntry} from '../entities.js';
import {EnumEntryRenderable} from '../entities/renderables.js';
import {addRenderableCodeToc} from './code-transforms.js';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.js';
import {addRenderableMembers} from './member-transforms.js';
import {addModuleName} from './module-name.js';

/** Given an unprocessed enum entry, get the fully renderable enum entry. */
export function getEnumRenderable(classEntry: EnumEntry, moduleName: string): EnumEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addRenderableMembers(
        addHtmlAdditionalLinks(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(addHtmlDescription(addModuleName(classEntry, moduleName))),
          ),
        ),
      ),
    ),
  );
}
