import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports programmatic writes to the signal inputs of `KbqNumberInput` and `KbqInput`. Never writes. */
export default function inputSignals(options: Schema): Rule {
    return warnOnlyRule({ label: '[input-signals]', warnPatterns, summary: SUMMARY }, options);
}
