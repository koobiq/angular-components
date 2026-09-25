import { InterfaceEntry } from '../entities';
import { InterfaceEntryRenderable } from '../entities/renderables';
import { addHtmlDescription, addHtmlJsDocTagComments, addHtmlUsageNotes, setEntryFlags } from './jsdoc-transforms';
import { addRenderableMembers } from './member-transforms';

/** Given an unprocessed interface entry, get the fully renderable interface entry. */
export function getInterfaceRenderable(entry: InterfaceEntry): InterfaceEntryRenderable {
    return setEntryFlags(
        addRenderableMembers(
            addHtmlUsageNotes(addHtmlJsDocTagComments(addHtmlDescription(entry, entry.name), entry.name), entry.name)
        )
    );
}
