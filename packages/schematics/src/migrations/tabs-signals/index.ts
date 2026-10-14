import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports subclasses of the tabs classes and direct calls of their `ngOnChanges`. Never writes. */
export default function tabsSignals(options: Schema): Rule {
    return warnOnlyRule({ label: '[tabs-signals]', warnPatterns, summary: SUMMARY }, options);
}
