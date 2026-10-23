import { expect, Locator, Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('KbqProgressBar', () => {
    test.describe('E2eProgressBarStateAndStyle', () => {
        const getComponent = (page: Page) => page.getByTestId('e2eProgressBarStateAndStyle');
        const getTestTable = (locator: Locator) => locator.getByTestId('e2eProgressBarTable');

        test('states', async ({ page }) => {
            await page.goto('/E2eProgressBarStateAndStyle');
            const locator = getComponent(page);
            const screenshotTarget = getTestTable(locator);

            await expect(screenshotTarget).toHaveScreenshot('01-light.png');
            await e2eEnableDarkTheme(page);
            await expect(screenshotTarget).toHaveScreenshot('01-dark.png');
        });

        // The suite runs with `reducedMotion: 'reduce'` in `contextOptions`, so the animated
        // indeterminate fill is only reachable by opting this describe out of it.
        test.describe('indeterminate', () => {
            test.use({
                contextOptions: {
                    deviceScaleFactor: 2,
                    reducedMotion: 'no-preference',
                    viewport: { width: 1200, height: 720 }
                }
            });

            // Both ends of the animation are chosen so that the fill enters and leaves the track rather
            // than parking outside it: at `translateX(-150%)` the clipped track had no fill in it for
            // the first and last fifth of every iteration, which reads as an animation that restarts
            // rather than one that runs. Both assertions about the ends are false at that value.
            test('sweeps the fill across the track without idling outside it', async ({ page }) => {
                await page.goto('/E2eProgressBarStateAndStyle');

                const travel = await page.getByTestId('e2eProgressBarIndeterminate').evaluate(async (host) => {
                    const fill = host.querySelector('.kbq-progress-bar__line') as HTMLElement;
                    const track = fill.parentElement as HTMLElement;
                    const animation = fill
                        .getAnimations()
                        .find(
                            (candidate) =>
                                (candidate as CSSAnimation).animationName === 'kbq-progress-bar-indeterminate'
                        );

                    if (!animation) {
                        return null;
                    }

                    animation.pause();

                    const duration = Number(animation.effect!.getComputedTiming().duration);
                    // Not 1: a `currentTime` at the duration is past the last keyframe and reports the
                    // animation's finished state rather than the frame the iteration ends on.
                    const offsets = [0, 0.25, 0.5, 0.75, 0.99];
                    const samples: { left: number; right: number }[] = [];

                    // Paused and scrubbed, so the geometry is a property of the keyframes rather than of
                    // how many frames the runner managed to observe.
                    for (const progress of offsets) {
                        animation.currentTime = duration * progress;
                        await new Promise((resolve) => requestAnimationFrame(resolve));

                        const fillBox = fill.getBoundingClientRect();
                        const trackBox = track.getBoundingClientRect();

                        samples.push({
                            left: fillBox.left - trackBox.left,
                            right: fillBox.right - trackBox.left
                        });
                    }

                    return { width: track.getBoundingClientRect().width, samples };
                });

                expect(travel).not.toBeNull();

                const { width, samples } = travel!;

                // Halfway through the iteration the fill is on screen. At both ends it is still on it:
                // the trailing edge has not been parked left of the track, and by the last sampled frame
                // the leading edge has crossed it, so the iteration ends with the fill leaving rather
                // than with an empty track waiting for it.
                expect(samples[2].left).toBeLessThan(width);
                expect(samples[2].right).toBeGreaterThan(0);
                expect(samples[0].right).toBeGreaterThanOrEqual(0);
                expect(samples[4].right).toBeGreaterThan(width);
            });
        });

        test.describe('reduced motion', () => {
            test('leaves the indeterminate fill narrower than a complete bar', async ({ page }) => {
                await page.goto('/E2eProgressBarStateAndStyle');

                // The preference comes from `contextOptions` in the shared config, and it is the whole
                // premise of what follows — so it is asserted rather than re-declared here. Re-declaring
                // it would mean overriding `contextOptions` wholesale and losing the viewport and
                // device scale factor along with it; asserting it fails loudly if the config changes.
                await expect
                    .poll(() => page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches))
                    .toBe(true);

                const fillWidth = (testid: string) =>
                    page
                        .getByTestId(testid)
                        .locator('.kbq-progress-bar__line')
                        .evaluate((line) => {
                            const track = line.parentElement!;

                            return line.getBoundingClientRect().width / track.getBoundingClientRect().width;
                        });

                const indeterminate = await fillWidth('e2eProgressBarIndeterminate');

                await expect.poll(() => fillWidth('e2eProgressBarComplete')).toBeCloseTo(1, 1);
                // Suppressing the animation used to leave the fill at `width: auto`, i.e. a full track
                // that is indistinguishable from a finished operation.
                expect(indeterminate).toBeLessThan(0.5);
                expect(indeterminate).toBeGreaterThan(0);
            });
        });
    });
});
