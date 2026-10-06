import { resolve } from 'node:path';
import { register } from 'ts-node';
import './fail-on-console';

const registered = Symbol.for('koobiq.ts-node');

// `SchematicTestRunner` loads a migration's factory with `require()`, which Vitest does not transform.
if (!(registered in globalThis)) {
    Object.defineProperty(globalThis, registered, { value: true });

    register({ transpileOnly: true, project: resolve(import.meta.dirname, '../../packages/schematics/tsconfig.json') });
}
