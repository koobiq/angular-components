import type { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import type { Schema } from './schema';

/** Reports reads of members that are `| undefined` now, and the contracts that became a constructor or abstract. */
export default function uninitializedMembers(options: Schema): Rule {
    return warnOnlyRule({ label: '[uninitialized-members]', warnPatterns, summary: SUMMARY }, options);
}
