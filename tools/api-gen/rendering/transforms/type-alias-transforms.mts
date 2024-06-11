import {TypeAliasEntry} from '../entities.mjs';
import {TypeAliasEntryRenderable} from '../entities/renderables.mjs';
import {addRenderableCodeToc} from './code-transforms.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';

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
