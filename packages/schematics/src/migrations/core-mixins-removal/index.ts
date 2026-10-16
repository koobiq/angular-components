import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports the uses of the removed `mixinDisabled` and `mixinTabIndex`. Never writes. */
export default function coreMixinsRemoval(options: Schema): Rule {
    return warnOnlyRule({ label: '[core-mixins-removal]', warnPatterns, summary: SUMMARY }, options);
}
