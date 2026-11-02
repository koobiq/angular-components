import type { Rule } from '@angular-devkit/schematics';
import { signalMembersRule } from '../../utils/signal-members-migration';
import { config } from './data';
import type { Schema } from './schema';

export default function optionSignals(options: Schema): Rule {
    return signalMembersRule(config, options);
}
