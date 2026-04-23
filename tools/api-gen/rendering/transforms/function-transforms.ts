import { FunctionEntry, FunctionWithOverloads } from '../entities';
import { FunctionEntryRenderable } from '../entities/renderables';
import { addRenderableCodeToc } from './code-transforms';
import {
    addHtmlAdditionalLinks,
    addHtmlDescription,
    addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './jsdoc-transforms';
import { addModuleName } from './module-name';
import { addRenderableFunctionParams } from './params-transforms';

/**
 * The Angular extractor may produce function entries shaped like `FunctionWithOverloads`
 * (with params/returnType nested inside `signatures[0]`) rather than directly on the entry.
 * This normalizes such entries so params and returnType are always at the top level.
 */
function normalizeFunctionEntry(entry: FunctionEntry): FunctionEntry {
    const withOverloads = entry as unknown as FunctionWithOverloads & FunctionEntry;
    const firstSignature: FunctionEntry | undefined = withOverloads.signatures?.[0];

    if (firstSignature) {
        return {
            ...entry,
            params: entry.params ?? firstSignature.params ?? [],
            returnType: entry.returnType ?? firstSignature.returnType ?? ''
        };
    }

    return {
        ...entry,
        params: entry.params ?? [],
        returnType: entry.returnType ?? ''
    };
}

/** Given an unprocessed function entry, get the fully renderable function entry. */
export function getFunctionRenderable(entry: FunctionEntry, moduleName: string): FunctionEntryRenderable {
    return setEntryFlags(
        addRenderableCodeToc(
            addRenderableFunctionParams(
                addHtmlAdditionalLinks(
                    addHtmlUsageNotes(
                        addHtmlJsDocTagComments(
                            addHtmlDescription(addModuleName(normalizeFunctionEntry(entry), moduleName))
                        )
                    )
                )
            )
        )
    );
}
