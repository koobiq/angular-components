import { TypeAliasEntry } from '../entities';
import { TypeAliasEntryRenderable } from '../entities/renderables';
import { addRenderableCodeToc } from './code-transforms';
import {
    addHtmlAdditionalLinks,
    addHtmlDescription,
    addHtmlJsDocTagComments,
    addHtmlUsageNotes,
    setEntryFlags
} from './jsdoc-transforms';
import { addModuleName } from './module-name';

/** Given an unprocessed type alias entry, get the fully renderable type alias entry. */
export function getTypeAliasRenderable(typeAliasEntry: TypeAliasEntry, moduleName: string): TypeAliasEntryRenderable {
    return setEntryFlags(
        addRenderableCodeToc(
            addHtmlAdditionalLinks(
                addHtmlUsageNotes(
                    addHtmlJsDocTagComments(addHtmlDescription(addModuleName(typeAliasEntry, moduleName)))
                )
            )
        )
    );
}
