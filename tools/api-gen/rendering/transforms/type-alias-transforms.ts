/*!
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.dev/license
 */

import {TypeAliasEntry} from '../entities.ts';
import {TypeAliasEntryRenderable} from '../entities/renderables.ts';
import {addRenderableCodeToc} from './code-transforms.ts';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.ts';
import {addModuleName} from './module-name.ts';

/** Given an unprocessed type alias entry, get the fully renderable type alias entry. */
export function getTypeAliasRenderable(
  typeAliasEntry: TypeAliasEntry,
  moduleName: string,
): TypeAliasEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(addHtmlDescription(addModuleName(typeAliasEntry, moduleName))),
        ),
      ),
    ),
  );
}
