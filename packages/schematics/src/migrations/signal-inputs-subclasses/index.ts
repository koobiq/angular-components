import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/** Reports subclasses of the components whose inputs became signal inputs feeding writable members. Never writes. */
export default function signalInputsSubclasses(options: Schema): Rule {
    return warnOnlyRule({ label: '[signal-inputs-subclasses]', warnPatterns, summary: SUMMARY }, options);
}
