import { FunctionEntry } from '../entities';
import { FunctionEntryRenderable } from '../entities/renderables';
import { addHtmlDescription, addHtmlJsDocTagComments, addHtmlUsageNotes, setEntryFlags } from './jsdoc-transforms';
import { normalizeFunctionFields } from './normalize-function-fields';
import { addRenderableFunctionParams } from './params-transforms';

/** Given an unprocessed function entry, get the fully renderable function entry. */
export function getFunctionRenderable(entry: FunctionEntry): FunctionEntryRenderable {
    const normalized = normalizeFunctionFields(entry);

    return setEntryFlags(
        addRenderableFunctionParams(
            addHtmlUsageNotes(
                addHtmlJsDocTagComments(addHtmlDescription(normalized, normalized.name), normalized.name),
                normalized.name
            )
        )
    );
}
