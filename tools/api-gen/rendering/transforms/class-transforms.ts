import { ClassEntry } from '../entities';
import { ClassEntryRenderable } from '../entities/renderables';
import { addRenderableCodeToc } from './code-transforms';
import {
    addHtmlAdditionalLinks,
    addHtmlDescription,
    addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './jsdoc-transforms';
import { addRenderableGroupMembers } from './member-transforms';
import { addModuleName } from './module-name';

/** Given an unprocessed class entry, get the fully renderable class entry. */
export function getClassRenderable(classEntry: ClassEntry, moduleName: string): ClassEntryRenderable {
    return setEntryFlags(
        addRenderableCodeToc(
            addRenderableGroupMembers(
                addHtmlAdditionalLinks(
                    addHtmlUsageNotes(
                        addHtmlJsDocTagComments(addHtmlDescription(addModuleName(classEntry, moduleName)))
                    )
                )
            )
        )
    );
}
