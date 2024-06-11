import {ConstantEntry} from '../entities.mjs';
import {ConstantEntryRenderable} from '../entities/renderables.mjs';
import {addRenderableCodeToc} from './code-transforms.mjs';
import {
  addHtmlAdditionalLinks,
  addHtmlDescription,
  addHtmlJsDocTagComments,
  addHtmlUsageNotes,
  setEntryFlags,
} from './jsdoc-transforms.mjs';
import {addModuleName} from './module-name.mjs';

/** Given an unprocessed constant entry, get the fully renderable constant entry. */
export function getConstantRenderable(
  classEntry: ConstantEntry,
  moduleName: string,
): ConstantEntryRenderable {
  return setEntryFlags(
    addRenderableCodeToc(
      addHtmlAdditionalLinks(
        addHtmlUsageNotes(
          addHtmlJsDocTagComments(addHtmlDescription(addModuleName(classEntry, moduleName))),
        ),
      ),
    ),
  );
}
