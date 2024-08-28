import { FunctionEntry } from '../entities';
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

/** Given an unprocessed function entry, get the fully renderable function entry. */
export function getFunctionRenderable(entry: FunctionEntry, moduleName: string): FunctionEntryRenderable {
    return setEntryFlags(
        addRenderableCodeToc(
            addRenderableFunctionParams(
                addHtmlAdditionalLinks(
                    addHtmlUsageNotes(addHtmlJsDocTagComments(addHtmlDescription(addModuleName(entry, moduleName))))
                )
            )
        )
    );
}
