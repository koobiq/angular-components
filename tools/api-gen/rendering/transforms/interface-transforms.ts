/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InterfaceEntry} from '../entities.ts';
import {InterfaceEntryRenderable} from '../entities/renderables.ts';
import {addRenderableCodeToc} from './code-transforms.ts';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.ts';
import {addRenderableGroupMembers} from './member-transforms.ts';
import {addModuleName} from './module-name.ts';

/** Given an unprocessed interface entry, get the fully renderable interface entry. */
export function getInterfaceRenderable(
  entry: InterfaceEntry,
  moduleName: string,
): InterfaceEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addRenderableGroupMembers(
        addHtmlAdditionalLinks(
          addHtmlUsageNotes(
            addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))),
          ),
        ),
      ),
    ),
  );
}
