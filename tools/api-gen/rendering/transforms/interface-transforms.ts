import { InterfaceEntry } from '../entities';
import { InterfaceEntryRenderable } from '../entities/renderables';
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

/** Given an unprocessed interface entry, get the fully renderable interface entry. */
export function getInterfaceRenderable(entry: InterfaceEntry, moduleName: string): InterfaceEntryRenderable {
    return setEntryFlags(
        addRenderableCodeToc(
            addRenderableGroupMembers(
                addHtmlAdditionalLinks(
                    addHtmlUsageNotes(addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))))
                )
            )
        )
    );
}
