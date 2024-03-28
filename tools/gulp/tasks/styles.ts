import { task, dest, series, parallel } from 'gulp';
import { join } from 'path';

import { buildConfig } from '../build-config';
import { buildScssPipeline } from '../utils/build-scss-pipeline';


const sourceDir = `${buildConfig.packagesDir}/components`;

/** Path to the directory where all releases are created. */
const releasesDir = buildConfig.outputDir;

// Path to the release output of components.
const releasePath = join(releasesDir, 'components');


task('components:prebuilt-themes:scss', () => {
    return buildScssPipeline(`${sourceDir}/core/styles/theming/prebuilt`, true)
        .pipe(dest(join(releasePath, 'prebuilt-themes')));
});

task('styles:built-all', series(parallel('components:prebuilt-themes:scss')));
