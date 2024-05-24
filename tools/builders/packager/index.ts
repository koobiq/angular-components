import { createBuilder } from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';

import { packager } from './build';
import { IPackagerOptions } from './schema';

export default createBuilder<IPackagerOptions & JsonObject>(packager);
