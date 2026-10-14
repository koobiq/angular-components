import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports subclasses of the datepicker classes and direct calls of their `ngOnChanges`. Never writes. */
export default function datepickerSignals(options: Schema): Rule {
    return warnOnlyRule({ label: '[datepicker-signals]', warnPatterns, summary: SUMMARY }, options);
}
