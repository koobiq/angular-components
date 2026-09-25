import { MemberEntry } from '../entities';
import { isClassMethodEntry } from '../entities/categorization';
import { HasMembers, HasRenderableMembers } from '../entities/traits';
import { addHtmlDescription, addHtmlJsDocTagComments, setEntryFlags } from './jsdoc-transforms';
import { normalizeFunctionFields } from './normalize-function-fields';

/** Given an entity with members, gets the entity augmented with renderable members, in their source order. */
export function addRenderableMembers<T extends HasMembers & { name: string }>(entry: T): T & HasRenderableMembers {
    const members = entry.members.map((member) => {
        const context = `${entry.name}.${member.name}`;

        // Normalized first: a method documented on its overloads keeps its text under `signatures[0]`.
        return setEntryFlags(
            addHtmlDescription(addHtmlJsDocTagComments(addMethodParamsDescription(member, context), context), context)
        );
    });

    return { ...entry, members };
}

function addMethodParamsDescription<T extends MemberEntry>(entry: T, context: string): T {
    if (isClassMethodEntry(entry)) {
        const normalized = normalizeFunctionFields(entry);

        return {
            ...normalized,
            params: normalized.params?.map((param) => addHtmlDescription(param, `${context}(${param.name})`))
        };
    }

    return entry;
}
