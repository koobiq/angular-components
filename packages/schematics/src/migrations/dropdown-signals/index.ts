import { Rule } from '@angular-devkit/schematics';
import { signalMembersRule } from '../../utils/signal-members-migration';
import { config } from './data';
import { Schema } from './schema';

export default function dropdownSignals(options: Schema): Rule {
    return signalMembersRule(config, options);
}
