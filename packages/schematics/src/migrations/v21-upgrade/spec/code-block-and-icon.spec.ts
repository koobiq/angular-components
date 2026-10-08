import { runV21Upgrade } from '../testing';

const CODE_BLOCK_PAIR = 'binds `canLoad` next to `canDownload`';
const CODE_BLOCK_MEMBER = 'their backing inputs `canLoadInput` and `codeFilesInput`';
const SCROLLABLE = 'KbqCodeBlock.scrollableCodeContent was removed';
const SMALL_ATTRIBUTE = 'KbqIconButton `small` was removed';
const SMALL_MEMBER = 'KbqIconButton.small was removed';

describe('v21-upgrade: code-block-and-icon', () => {
    it('rewrites canLoad to canDownload in every attribute form', async () => {
        const template = [
            '<kbq-code-block [canLoad]="allowed" [files]="files" />',
            '<kbq-code-block canLoad="true" [files]="files" />',
            '<kbq-code-block',
            '    [files]="files"',
            '    canLoad',
            '/>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'can-load.html': template });

        expect(run.read('can-load.html')).toBe(
            [
                '<kbq-code-block [canDownload]="allowed" [files]="files" />',
                '<kbq-code-block canDownload="true" [files]="files" />',
                '<kbq-code-block',
                '    [files]="files"',
                '    canDownload',
                '/>',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(CODE_BLOCK_PAIR);
    });

    it('rewrites codeFiles to files in an inline template', async () => {
        const source = [
            "import { KbqCodeBlockModule } from '@koobiq/components/code-block';",
            '@Component({',
            '    imports: [KbqCodeBlockModule],',
            '    template: `<kbq-code-block [codeFiles]="files" [canLoad]="true" />`',
            '})',
            'export class App {}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'code-files.ts': source });

        expect(run.read('code-files.ts')).toBe(
            source.replace('[codeFiles]="files" [canLoad]', '[files]="files" [canDownload]')
        );
    });

    it('reports a code block that binds an alias next to its replacement and leaves it alone', async () => {
        const template = '<kbq-code-block [codeFiles]="legacy" [files]="files" canLoad [canDownload]="true" />\n';
        const run = await runV21Upgrade({ 'pair.html': template });

        expect(run.read('pair.html')).toBe(template);
        expect(run.log).toContain(CODE_BLOCK_PAIR);
    });

    it('reports canLoad, codeFiles and their backing inputs read off a KbqCodeBlock', async () => {
        const source = [
            "import { KbqCodeBlock } from '@koobiq/components/code-block';",
            'export class App {',
            '    readonly codeBlock = viewChild.required(KbqCodeBlock);',
            '    get loadable() { return this.codeBlock().canLoadInput(); }',
            '    setFiles(block: KbqCodeBlock) { block.codeFiles = []; }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'members.ts': source });

        expect(run.read('members.ts')).toBe(source);
        expect(run.log).toContain(CODE_BLOCK_MEMBER);
    });

    it('reports scrollableCodeContent read through the exportAs template reference', async () => {
        const template = [
            '<kbq-code-block #codeBlock="kbqCodeBlock" [files]="files" />',
            '<button (click)="codeBlock.scrollableCodeContent().scrollTo({ top: 0 })">Top</button>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'scrollable.html': template });

        expect(run.read('scrollable.html')).toBe(template);
        expect(run.log).toContain(SCROLLABLE);
    });

    it('rewrites small to size on an icon button', async () => {
        const template = [
            '<i kbq-icon-button="kbq-plus_16" [small]="true"></i>',
            '<i kbq-icon-button="kbq-plus_16" [small]="false"></i>',
            '<i [small]="isSmall" kbq-icon-button="kbq-plus_16"></i>',
            '<button',
            '    [kbq-icon-button]="icon"',
            '    [small]="dense && !wide"',
            '></button>',
            '<i kbq-icon-button="kbq-plus_16" small="true"></i>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'small.html': template });

        expect(run.read('small.html')).toBe(
            [
                '<i kbq-icon-button="kbq-plus_16" size="compact"></i>',
                '<i kbq-icon-button="kbq-plus_16" size="normal"></i>',
                `<i [size]="isSmall ? 'compact' : 'normal'" kbq-icon-button="kbq-plus_16"></i>`,
                '<button',
                '    [kbq-icon-button]="icon"',
                `    [size]="(dense && !wide) ? 'compact' : 'normal'"`,
                '></button>',
                '<i kbq-icon-button="kbq-plus_16" size="compact"></i>',
                ''
            ].join('\n')
        );
        expect(run.log).not.toContain(SMALL_ATTRIBUTE);
    });

    it('reports a small it cannot rewrite and leaves it alone', async () => {
        const template = [
            '<i kbq-icon-button="kbq-plus_16" size="normal" [small]="true"></i>',
            '<i kbq-icon-button="kbq-plus_16" small></i>',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'small-left.html': template });

        expect(run.read('small-left.html')).toBe(template);
        expect(run.log).toContain(SMALL_ATTRIBUTE);
    });

    it('rewrites the kbq-icon-button_small class in styles and code', async () => {
        const styles = '.toolbar .kbq-icon-button_small {\n    color: red;\n}\n';
        const source = "export const small = host.querySelector('.kbq-icon-button_small');\n";
        const run = await runV21Upgrade({ 'class.scss': styles, 'class.ts': source });

        expect(run.read('class.scss')).toBe(styles.replace('_small', '_compact'));
        expect(run.read('class.ts')).toBe(source.replace('_small', '_compact'));
    });

    it('reports small read off a KbqIconButton', async () => {
        const source = [
            "import { KbqIconButton } from '@koobiq/components/icon';",
            'export class App {',
            '    readonly button = viewChild.required(KbqIconButton);',
            '    get compact() { return this.button().small(); }',
            '}',
            ''
        ].join('\n');
        const run = await runV21Upgrade({ 'small-member.ts': source });

        expect(run.read('small-member.ts')).toBe(source);
        expect(run.log).toContain(SMALL_MEMBER);
    });

    it('leaves the same names on other elements and in unrelated code alone', async () => {
        const template = [
            '<app-viewer [codeFiles]="files" [canLoad]="true" [small]="true" small="true" />',
            '<i kbq-icon="kbq-plus_16" [small]="true"></i>',
            '<kbq-code-block-preview canLoad [codeFiles]="files" />',
            ''
        ].join('\n');
        const source = [
            "import { KbqIconButtonSize } from '@koobiq/components/icon';",
            "export const routes = [{ path: 'docs', canLoad: [guard], data: { codeFiles: [] } }];",
            "export const size: KbqIconButtonSize = sizes.small ? 'compact' : 'normal';",
            'export const block = viewer.codeFiles;',
            ''
        ].join('\n');
        const styles = '.kbq-icon-button {\n    --kbq-icon-button-size-small-vertical-padding: 0;\n}\n';
        const run = await runV21Upgrade({ 'other.html': template, 'other.ts': source, 'other.scss': styles });

        expect(run.read('other.html')).toBe(template);
        expect(run.read('other.ts')).toBe(source);
        expect(run.read('other.scss')).toBe(styles);
        expect(run.log).not.toContain('[v21-upgrade] /');
    });
});
