import { DocEntry } from './entities';
import {
    isClassEntry,
    isConstantEntry,
    isEnumEntry,
    isFunctionEntry,
    isInterfaceEntry,
    isTypeAliasEntry
} from './entities/categorization';
import { DocEntryRenderable } from './entities/renderables';
import { getClassRenderable } from './transforms/class-transforms';
import { getConstantRenderable } from './transforms/constant-transforms';
import { getEnumRenderable } from './transforms/enum-transforms';
import { getFunctionRenderable } from './transforms/function-transforms';
import { getInterfaceRenderable } from './transforms/interface-transforms';
import {
    addHtmlDescription,
    addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './transforms/jsdoc-transforms';
import { getTypeAliasRenderable } from './transforms/type-alias-transforms';

export function getRenderable(entry: DocEntry): DocEntryRenderable {
    if (isClassEntry(entry)) {
        return getClassRenderable(entry);
    }

    if (isConstantEntry(entry)) {
        return getConstantRenderable(entry);
    }

    if (isEnumEntry(entry)) {
        return getEnumRenderable(entry);
    }

    if (isInterfaceEntry(entry)) {
        return getInterfaceRenderable(entry);
    }

    if (isFunctionEntry(entry)) {
        return getFunctionRenderable(entry);
    }

    if (isTypeAliasEntry(entry)) {
        return getTypeAliasRenderable(entry);
    }

    // Fallback to an uncategorised renderable.
    return setEntryFlags(
        addHtmlDescription(addHtmlUsageNotes(addHtmlJsDocTagComments(entry, entry.name), entry.name), entry.name)
    );
}
