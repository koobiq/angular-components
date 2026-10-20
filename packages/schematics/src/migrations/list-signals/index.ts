import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports programmatic writes to the signal inputs of `KbqListSelection` and `KbqListOption`. Never writes. */
export default function listSignals(options: Schema): Rule {
    return warnOnlyRule({ label: '[list-signals]', warnPatterns, summary: SUMMARY }, options);
}
