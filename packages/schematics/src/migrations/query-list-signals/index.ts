import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports subclasses that redeclare the query members now behind getters, and writes to them. Never writes. */
export default function queryListSignals(options: Schema): Rule {
    return warnOnlyRule({ label: '[query-list-signals]', warnPatterns, summary: SUMMARY }, options);
}
