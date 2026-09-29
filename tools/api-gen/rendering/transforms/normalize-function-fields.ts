import { FunctionEntry, FunctionWithOverloads, ParameterEntry } from '../entities';

/**
 * `@param name - text`, the way TSDoc writes it, leaves the hyphen in the text, where Markdown reads it as a
 * list. VS Code drops it from a hover the same way.
 */
const withoutHyphen = (param: ParameterEntry): ParameterEntry => ({
    ...param,
    description: param.description?.replace(/^\s*-\s+/, '')
});

/**
 * The Angular extractor returns a function-shaped entry — a top-level function or a class method — as
 * `FunctionWithOverloads`: params, returnType, returnDescription (and, for a top-level function, description
 * and JsDoc tags too) live under `signatures[0]` and `implementation`, not on the entry itself. A class
 * method carries description/JsDoc tags at both levels, but never params/returnType; a top-level function
 * carries none of them flat. Without this, params/returnType/description are silently empty depending on
 * which of the two shapes the extractor happened to return.
 */
export function normalizeFunctionFields<T extends Partial<FunctionEntry>>(entry: T): T {
    const withOverloads = entry as unknown as FunctionWithOverloads & T;
    // A constructor, or a method of an interface, comes with no signatures and only the implementation.
    const firstSignature = withOverloads.signatures?.[0] ?? withOverloads.implementation;

    if (!firstSignature) {
        return {
            ...entry,
            jsdocTags: entry.jsdocTags ?? [],
            params: (entry.params ?? []).map(withoutHyphen),
            returnType: entry.returnType ?? ''
        };
    }

    const jsdocTags = entry.jsdocTags?.length ? entry.jsdocTags : (firstSignature.jsdocTags ?? []);

    return {
        ...entry,
        description: entry.description || firstSignature.description || '',
        rawComment: entry.rawComment || firstSignature.rawComment || '',
        jsdocTags,
        params: (entry.params ?? firstSignature.params ?? []).map(withoutHyphen),
        returnType: entry.returnType ?? firstSignature.returnType ?? '',
        // A method's `@returns` stays a tag: the extractor splits it off only for a top-level function.
        returnDescription:
            entry.returnDescription ??
            firstSignature.returnDescription ??
            jsdocTags.find(({ name }) => name === 'returns')?.comment
    };
}
