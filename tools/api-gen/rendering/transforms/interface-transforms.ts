/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {InterfaceEntry} from '../entities.js';
import {InterfaceEntryRenderable} from '../entities/renderables.js';
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
