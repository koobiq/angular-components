/* eslint-disable @typescript-eslint/naming-convention */
import { Type } from '@angular/core';

/**
 * Test stub for `@koobiq/docs-examples/loader`, whose generated source imports every folder of examples. Wired in
 * via root `tsconfig.json` paths for specs only, like `docs-examples.stub.ts`.
 */
export async function loadExampleComponent(_id: string): Promise<Type<unknown> | undefined> {
    return undefined;
}
