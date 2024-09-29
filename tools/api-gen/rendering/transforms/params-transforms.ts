import { ParameterEntry } from '../entities';
import { HasParams, HasRenderableParams } from '../entities/traits';
import { addHtmlDescription } from './jsdoc-transforms';

export function addRenderableFunctionParams<T extends HasParams>(entry: T): T & HasRenderableParams {
    const params = entry.params?.map((entry: ParameterEntry) => addHtmlDescription(entry));

    return {
        ...entry,
        params
    };
}
