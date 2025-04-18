import nunjucks from 'nunjucks';
import { join } from 'path';
import { HighlightNunjucksExtension } from './nunjucks-tags/highlight';

const TEMPLATE_DIR = join(process.cwd(), 'tools', 'api-gen', 'rendering', 'templates');
const env = nunjucks.configure(TEMPLATE_DIR, {
    autoescape: false,
    tags: {
        blockStart: '{%',
        blockEnd: '%}',
        variableStart: '{$',
        variableEnd: '$}'
    }
});

env.addExtension('HighlightJsExtension', new HighlightNunjucksExtension());

export function renderEntry(entryPointContext: any) {
    try {
        return env.getTemplate('entry-point.template.html').render({ doc: entryPointContext });
    } catch (e) {
        console.warn(e);

        return '';
    }
}
