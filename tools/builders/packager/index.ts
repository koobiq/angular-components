import { createBuilder } from '@angular-devkit/architect';
import type { JsonObject } from '@angular-devkit/core';
import { packager } from './build';
import type { IPackagerOptions } from './schema';

export default createBuilder<IPackagerOptions & JsonObject>(packager);
