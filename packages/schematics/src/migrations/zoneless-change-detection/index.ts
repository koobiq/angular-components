import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/**
 * Reports the uses of the removed `MockNgZone` testing helper. Never writes: a spec that waited for
 * `NgZone.onStable` has to render or wait explicitly, and which of the two depends on the spec.
 */
export default function zonelessChangeDetection(options: Schema): Rule {
    return warnOnlyRule({ label: '[zoneless-change-detection]', warnPatterns, summary: SUMMARY }, options);
}
