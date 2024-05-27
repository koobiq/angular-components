/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {EnumEntry} from '../entities.ts';
import {EnumEntryRenderable} from '../entities/renderables.ts';
import {addRenderableCodeToc} from './code-transforms.ts';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.ts';
import {addRenderableMembers} from './member-transforms.ts';
import {addModuleName} from './module-name.ts';

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
