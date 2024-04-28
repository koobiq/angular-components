//@ts-ignore
import { DocEntryRenderable } from './entities/renderables.js';
import {
    isClassEntry,
    isConstantEntry,
    isEnumEntry,
    isFunctionEntry,
    isInterfaceEntry, isTypeAliasEntry//@ts-ignore
} from './entities/categorization.js';//@ts-ignore
import { getClassRenderable } from './transforms/class-transforms.js';
import { getConstantRenderable } from './transforms/constant-transforms.js';
import { getEnumRenderable } from './transforms/enum-transforms.js';
import { getInterfaceRenderable } from './transforms/interface-transforms.js';
import { getFunctionRenderable } from './transforms/function-transforms.js';
import { getTypeAliasRenderable } from './transforms/type-alias-transforms.js';

import {
    addHtmlAdditionalLinks,
    addHtmlDescription, addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags//@ts-ignore
} from './transforms/jsdoc-transforms.js';
//@ts-ignore
import { addModuleName } from './transforms/module-name.js';
//@ts-ignore
import { DocEntry } from './entities.js';

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
