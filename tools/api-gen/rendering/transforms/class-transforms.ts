import { ClassEntry } from '../entities';
import { ClassEntryRenderable } from '../entities/renderables';
import { addHtmlDescription, addHtmlJsDocTagComments, addHtmlUsageNotes, setEntryFlags } from './jsdoc-transforms';
import { addRenderableMembers } from './member-transforms';

/** Given an unprocessed class entry, get the fully renderable class entry. */
export function getClassRenderable(classEntry: ClassEntry): ClassEntryRenderable {
    return setEntryFlags(
        addRenderableMembers(
            addHtmlUsageNotes(
                addHtmlJsDocTagComments(addHtmlDescription(classEntry, classEntry.name), classEntry.name),
                classEntry.name
            )
        )
    );
}
