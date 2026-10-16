import { Rule } from '@angular-devkit/schematics';
import { replacementMigrationRule } from '../../utils/replacement-driver';
import { scssReplacements, templateReplacements, tsReplacements, warnPatterns } from './data';
import { Schema } from './schema';

export default function v20Upgrade(options: Schema): Rule {
    return replacementMigrationRule(
        { label: '[v20-upgrade]', tsReplacements, templateReplacements, scssReplacements, warnPatterns },
        options
    );
}
