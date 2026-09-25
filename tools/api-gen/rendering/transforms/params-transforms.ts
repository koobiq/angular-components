import { ParameterEntry } from '../entities';
import { HasParams, HasRenderableParams } from '../entities/traits';
import { addHtmlDescription } from './jsdoc-transforms';

export function addRenderableFunctionParams<T extends HasParams & { name: string }>(entry: T): T & HasRenderableParams {
    const params = (entry.params ?? []).map((param: ParameterEntry) =>
        addHtmlDescription(param, `${entry.name}(${param.name})`)
    );

    return {
        ...entry,
        params
    };
}
