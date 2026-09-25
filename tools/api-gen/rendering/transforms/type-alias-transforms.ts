import { TypeAliasEntry } from '../entities';
import { TypeAliasEntryRenderable } from '../entities/renderables';
import { addHtmlDescription, addHtmlJsDocTagComments, addHtmlUsageNotes, setEntryFlags } from './jsdoc-transforms';

/** Given an unprocessed type alias entry, get the fully renderable type alias entry. */
export function getTypeAliasRenderable(entry: TypeAliasEntry): TypeAliasEntryRenderable {
    return setEntryFlags(
        addHtmlUsageNotes(addHtmlJsDocTagComments(addHtmlDescription(entry, entry.name), entry.name), entry.name)
    );
}
