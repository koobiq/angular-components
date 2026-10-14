import { Rule } from '@angular-devkit/schematics';
import { warnOnlyRule } from '../../utils/warn-only-migration';
import { SUMMARY, warnPatterns } from './data';
import { Schema } from './schema';

/**
 * Reports the uses of the removed animation triggers and of the members that carried an `AnimationEvent`.
 * Never writes: what replaces a member depends on what the code did with the event.
 */
export default function angularAnimationsRemoval(options: Schema): Rule {
    return warnOnlyRule({ label: '[angular-animations-removal]', warnPatterns, summary: SUMMARY }, options);
}
