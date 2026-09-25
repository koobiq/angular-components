import { ConstantEntry } from '../entities';
import { ConstantEntryRenderable } from '../entities/renderables';
import { addHtmlDescription, addHtmlJsDocTagComments, addHtmlUsageNotes, setEntryFlags } from './jsdoc-transforms';

/** Given an unprocessed constant entry, get the fully renderable constant entry. */
export function getConstantRenderable(entry: ConstantEntry): ConstantEntryRenderable {
    return setEntryFlags(
        addHtmlUsageNotes(addHtmlJsDocTagComments(addHtmlDescription(entry, entry.name), entry.name), entry.name)
    );
}
