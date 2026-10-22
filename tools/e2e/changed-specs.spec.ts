import { reachedSpecs } from './changed-specs.mjs';

const SPECS = [
    'packages/components/button/e2e.playwright-spec.ts',
    'packages/components/core/overlay/e2e.playwright-spec.ts',
    'packages/components/scrollbar/deprecated/e2e.playwright-spec.ts',
    'packages/components/scrollbar/e2e.playwright-spec.ts',
    'packages/components/tabs/e2e.playwright-spec.ts'
];

describe(reachedSpecs.name, () => {
    it('takes every spec of a component one of whose files changed', () => {
        expect(reachedSpecs(['packages/components/scrollbar/scrollbar.ts'], SPECS)).toEqual([
            'packages/components/scrollbar/deprecated/e2e.playwright-spec.ts',
            'packages/components/scrollbar/e2e.playwright-spec.ts'
        ]);
    });

    it('takes a changed spec, a scenario and a baseline alike, once each', () => {
        expect(
            reachedSpecs(
                [
                    'packages/components/tabs/e2e.playwright-spec.ts',
                    'packages/components/tabs/e2e.ts',
                    'packages/components/tabs/__screenshots__/01-light.png'
                ],
                SPECS
            )
        ).toEqual(['packages/components/tabs/e2e.playwright-spec.ts']);
    });

    it('takes only the specs of the changed core module', () => {
        expect(reachedSpecs(['packages/components/core/overlay/overlay-layer.ts'], SPECS)).toEqual([
            'packages/components/core/overlay/e2e.playwright-spec.ts'
        ]);
        expect(reachedSpecs(['packages/components/core/locales/en-US.ts'], SPECS)).toEqual([]);
    });

    it('ignores files outside the components and at their root', () => {
        expect(
            reachedSpecs(
                ['apps/docs/e2e.playwright-spec.ts', 'packages/e2e/utils/fonts.ts', 'packages/components/index.ts'],
                SPECS
            )
        ).toEqual([]);
    });

    it('drops a path that is not safe to pass through a shell', () => {
        const unsafe = 'packages/components/button/$(touch x).playwright-spec.ts';

        expect(reachedSpecs(['packages/components/button/button.ts'], [...SPECS, unsafe])).toEqual([
            'packages/components/button/e2e.playwright-spec.ts'
        ]);
    });
});
