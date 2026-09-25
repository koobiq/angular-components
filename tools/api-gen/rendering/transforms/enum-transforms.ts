import { EnumEntry } from '../entities';
import { EnumEntryRenderable } from '../entities/renderables';
import { addHtmlDescription, addHtmlJsDocTagComments, addHtmlUsageNotes, setEntryFlags } from './jsdoc-transforms';
import { addRenderableMembers } from './member-transforms';

/** Given an unprocessed enum entry, get the fully renderable enum entry. */
export function getEnumRenderable(entry: EnumEntry): EnumEntryRenderable {
    return setEntryFlags(
        addRenderableMembers(
            addHtmlUsageNotes(addHtmlJsDocTagComments(addHtmlDescription(entry, entry.name), entry.name), entry.name)
        )
    );
}
