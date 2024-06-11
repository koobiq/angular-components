import {InterfaceEntry} from '../entities.mjs';
import {InterfaceEntryRenderable} from '../entities/renderables.mjs';
import {addRenderableCodeToc} from './code-transforms.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addRenderableGroupMembers} from './member-transforms.mjs';
import {addModuleName} from './module-name.mjs';

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
