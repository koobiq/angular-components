import { DocEntryRenderable } from './entities/renderables.mjs';
import {
    isClassEntry,
    isConstantEntry,
    isEnumEntry,
    isFunctionEntry,
    isInterfaceEntry,
    isTypeAliasEntry
} from './entities/categorization.mjs';

import { getClassRenderable } from './transforms/class-transforms.mjs';
import { getConstantRenderable } from './transforms/constant-transforms.mjs';
import { getEnumRenderable } from './transforms/enum-transforms.mjs';
import { getInterfaceRenderable } from './transforms/interface-transforms.mjs';
import { getFunctionRenderable } from './transforms/function-transforms.mjs';
import { getTypeAliasRenderable } from './transforms/type-alias-transforms.mjs';

import {
    addHtmlAdditionalLinks,
    addHtmlDescription, addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './transforms/jsdoc-transforms.mjs';
import { addModuleName } from './transforms/module-name.mjs';
import { DocEntry } from './entities.mjs';

export function getRenderable(entry: DocEntry, moduleName: string): DocEntryRenderable {
    if (isClassEntry(entry)) {
        return getClassRenderable(entry, moduleName);
    }
    if (isConstantEntry(entry)) {
        return getConstantRenderable(entry, moduleName);
    }
    if (isEnumEntry(entry)) {
        return getEnumRenderable(entry, moduleName);
    }
    if (isInterfaceEntry(entry)) {
        return getInterfaceRenderable(entry, moduleName);
    }
    if (isFunctionEntry(entry)) {
        return getFunctionRenderable(entry, moduleName);
    }
    if (isTypeAliasEntry(entry)) {
        return getTypeAliasRenderable(entry, moduleName);
    }

    /*if (isInitializerApiFunctionEntry(entry)) {
        return getInitializerApiFunctionRenderable(entry, moduleName);
    }
    if (isCliEntry(entry)) {
        return getCliRenderable(entry);
    }*/

    // Fallback to an uncategorised renderable.
    return setEntryFlags(
        addHtmlAdditionalLinks(
            addHtmlDescription(
                addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(entry, moduleName))),
            ),
        ),
    );
}
