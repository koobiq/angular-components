import { DocEntryRenderable } from './entities/renderables.ts';
import {
    isClassEntry,
    isConstantEntry,
    isEnumEntry,
    isFunctionEntry,
    isInterfaceEntry,
    isTypeAliasEntry
} from './entities/categorization.ts';

import { getClassRenderable } from './transforms/class-transforms.ts';
import { getConstantRenderable } from './transforms/constant-transforms.ts';
import { getEnumRenderable } from './transforms/enum-transforms.ts';
import { getInterfaceRenderable } from './transforms/interface-transforms.ts';
import { getFunctionRenderable } from './transforms/function-transforms.ts';
import { getTypeAliasRenderable } from './transforms/type-alias-transforms.ts';

import {
    addHtmlAdditionalLinks,
    addHtmlDescription, addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './transforms/jsdoc-transforms.ts';
import { addModuleName } from './transforms/module-name.ts';
import { DocEntry } from './entities.ts';

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

    // Fallback to an uncategorized renderable.
    return setEntryFlags(
        addHtmlAdditionalLinks(
            addHtmlDescription(
                addHtmlUsageNotes(addHtmlJsDocTagComments(addModuleName(entry, moduleName))),
            ),
        ),
    );
}
