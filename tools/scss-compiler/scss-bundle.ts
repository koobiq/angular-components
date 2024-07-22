import autoprefixer from 'autoprefixer';
import fs from 'fs';
import glob from 'glob';
import path from 'path';
import postcss from 'postcss';
import * as sass from 'sass';

function writeScss({ src, dist }: { src: string; dist: string }) {
    return async (file: string) => {
        console.log(`SCSS transforming: ${file}...`);

        const { css } = await sass.compileAsync(file, {
            sourceMap: false,
            verbose: true,
            //sourceMapIncludeSources: true,
            style: 'compressed',
            loadPaths: ['node_modules']
        });

        const relativePathToSrcFile = path.relative(src, file);
        const dirname = path.dirname(relativePathToSrcFile);
        const basename = path.basename(relativePathToSrcFile, '.scss');
        const filename = path.join(dirname, `${basename}.css`);

        const srcOutFile = path.resolve(src, filename);
        const esmOutFile = path.resolve(dist, filename);

        isDirectoryExist(srcOutFile);
        isDirectoryExist(esmOutFile);

        const { css: processedCss } = await postProcessCss({ from: srcOutFile, css });

        fs.writeFileSync(esmOutFile, processedCss, 'utf-8');
    };
}

async function postProcessCss({ css, from }: { css: string; from: string }) {
    // const autoprefixerFn = autoprefixer({ overrideBrowserslist: ['> 1%', 'last 2 versions', 'ie >= 11'] });
    const postCssPlugins = [autoprefixer(), require('postcss-discard-comments')];
    return postcss(postCssPlugins).process(css, { from });
}

(async function () {
    const start = performance.now();
    console.log(`Compiling...`);

    const src = 'packages/components';
    const dist = 'dist/scss-compiled';
    const distPrebuiltThemes = `${dist}/core/styles/theming/prebuilt`;
    const componentsPath = path.resolve(process.cwd(), `${src}/**/*.scss`);

    const filesToCopy = glob.sync(componentsPath);
    filesToCopy.forEach(copyFiles(src, dist));

    const scssFiles = glob.sync(componentsPath);
    const scssPipe = writeScss({ src, dist });

    for (const file of scssFiles) {
        await scssPipe(file);
    }

    copyPrebuiltThemes(distPrebuiltThemes, 'dist/components/prebuilt-themes', 'dark-theme.css');
    copyPrebuiltThemes(distPrebuiltThemes, 'dist/components/prebuilt-themes', 'light-theme.css');

    const end = performance.now();
    console.log(`End time: ${(end - start) / 1000} seconds.`);
})();

function copyPrebuiltThemes(src: string, dist: string, file: string) {
    const content = fs.readFileSync(`${src}/${file}`);
    isDirectoryExist(`${dist}/${file}`);
    fs.writeFileSync(`${dist}/${file}`, content);
}

function copyFiles(src: string, dist: string) {
    return (file: string) => {
        const relativePathToSrcFile = path.relative(src, file);

        const dirname = path.dirname(relativePathToSrcFile);
        const extension = path.extname(relativePathToSrcFile);
        const basename = path.basename(relativePathToSrcFile, extension);
        const filename = path.join(dirname, `${basename}${extension}`);

        const esmOutFile = path.resolve(dist, filename);

        const content = fs.readFileSync(file);

        isDirectoryExist(esmOutFile);

        fs.writeFileSync(esmOutFile, content);
    };
}

function isDirectoryExist(filePath: string) {
    const dirname = path.dirname(filePath);

    if (!fs.existsSync(dirname)) {
        isDirectoryExist(dirname);
        fs.mkdirSync(dirname);
    }
}
