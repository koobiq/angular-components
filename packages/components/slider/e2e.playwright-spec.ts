import { END, ENTER, ESCAPE, HOME, LEFT_ARROW, RIGHT_ARROW, TAB, UP_ARROW } from '@angular/cdk/keycodes';
import { expect, type Locator, type Page, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

// Playwright sends native keyboard input by key name.
const keyName = {
    [TAB]: 'Tab',
    [RIGHT_ARROW]: 'ArrowRight',
    [LEFT_ARROW]: 'ArrowLeft',
    [UP_ARROW]: 'ArrowUp',
    [END]: 'End',
    [HOME]: 'Home',
    [ENTER]: 'Enter',
    [ESCAPE]: 'Escape'
};

test.describe('Slider appearance', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eSliderStateAndStyle');
        await page.mouse.move(1100, 700);
    });

    const capture = async (page: Page, target: Locator, name: string) => {
        await expect(target).toHaveScreenshot(`${name}-light.png`);
        await e2eEnableDarkTheme(page);
        await expect(target).toHaveScreenshot(`${name}-dark.png`);
    };

    for (const [number, group] of [
        ['01', 'states'],
        ['02', 'input'],
        ['03', 'fill'],
        ['04', 'marks-and-thumbs']
    ] as const) {
        test(group, async ({ page }) => {
            const target = page.getByTestId(group).getByTestId('e2eScreenshotTarget');

            await expect(target).toHaveCSS('display', 'inline-grid');
            await capture(page, target, `${number}-${group}`);
        });
    }

    test('direction', async ({ page }) => {
        const target = page.getByTestId('direction').getByTestId('e2eScreenshotTarget');
        const rtlThumb = target.locator('[dir="rtl"] .kbq-slider__thumb');

        await expect(rtlThumb).toHaveCSS('--kbq-slider-position', '70%');
        await capture(page, target, '05-direction');
    });

    test('focus-and-tooltip', async ({ page }) => {
        const target = page.getByTestId('focus-and-tooltip').getByTestId('e2eScreenshotTarget');
        const thumbs = target.getByRole('slider');

        await target.scrollIntoViewIfNeeded();
        await thumbs.first().focus();
        await page.keyboard.press(keyName[TAB]);
        await expect(thumbs.last()).toBeFocused();
        await expect(page.locator('.kbq-slider__tooltip')).toBeVisible();
        await capture(page, target, '06-focus-and-tooltip');
    });
});

test.describe('Slider interactions', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/E2eSliderInteraction');
    });

    test('shows the tooltip when hovering the thumb', async ({ page }) => {
        await page.getByTestId('single').getByRole('slider').hover();
        await expect(page.locator('.kbq-slider__tooltip')).toBeVisible();
    });

    test('disables pointer transitions before Tab focuses the thumb', async ({ page }) => {
        const slider = page.getByTestId('coincident');

        await page.getByRole('button', { name: 'Swap', exact: true }).click();
        await expect(slider).toHaveClass(/kbq-slider_pointer-motion/);
        await slider.evaluate((host) => {
            host.addEventListener(
                'focusin',
                () => {
                    host.dataset['pointerMotionAtFocus'] = String(host.classList.contains('kbq-slider_pointer-motion'));
                },
                { once: true }
            );
        });
        await page.keyboard.press(keyName[TAB]);

        await expect(slider.getByRole('slider').first()).toBeFocused();
        await expect(slider).toHaveAttribute('data-pointer-motion-at-focus', 'false');
    });

    test('supports track clicks and one commit for keyboard repeat', async ({ page }) => {
        const slider = page.getByTestId('single');
        const input = slider.getByRole('slider');

        await slider.click({ position: { x: 300, y: 16 } });
        await expect(input).toHaveAttribute('aria-valuenow', '77');
        await expect(page.getByTestId('commits')).toHaveText('1');
        await input.focus();
        await page.keyboard.down(keyName[RIGHT_ARROW]);
        await page.keyboard.down(keyName[RIGHT_ARROW]);
        await page.keyboard.down(keyName[RIGHT_ARROW]);
        await expect(input).toHaveAttribute('aria-valuenow', '80');
        await expect(page.getByTestId('commits')).toHaveText('1');
        await page.keyboard.up(keyName[RIGHT_ARROW]);
        await expect(page.getByTestId('commits')).toHaveText('2');
    });

    test('keeps pointer capture when releasing over an iframe', async ({ page }) => {
        const input = page.getByTestId('single').getByRole('slider');
        const box = await input.boundingBox();
        const frame = await page.locator('iframe').boundingBox();

        await page.mouse.move(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await page.mouse.down();
        await page.mouse.move(frame!.x + 200, frame!.y + 20);
        await page.mouse.up();
        await expect(page.getByTestId('commits')).toHaveText('1');
        const value = await input.getAttribute('aria-valuenow');

        await page.mouse.move(400, 60);
        await expect(input).toHaveAttribute('aria-valuenow', value!);
    });

    test('rolls back pointercancel and filters a second pointer', async ({ page }) => {
        const surface = page.getByTestId('single').locator('.kbq-slider__surface');
        const input = page.getByTestId('single').getByRole('slider');

        await surface.evaluate((element) => {
            const rect = element.getBoundingClientRect();

            element.setPointerCapture = () => {};

            const send = (type: string, pointerId: number, x: number): void => {
                element.dispatchEvent(
                    new PointerEvent(type, {
                        bubbles: true,
                        button: 0,
                        isPrimary: true,
                        pointerId,
                        clientX: rect.left + x,
                        clientY: rect.top + 16
                    })
                );
            };

            send('pointerdown', 1, 300);
            send('pointermove', 2, 0);
            send('pointerup', 2, 0);
        });
        await expect(input).toHaveAttribute('aria-valuenow', '77');
        await surface.dispatchEvent('pointercancel', { pointerId: 1 });
        await expect(input).toHaveAttribute('aria-valuenow', '30');
        await expect(page.getByTestId('commits')).toHaveText('0');
    });

    test('applies none, push and swap and retains keyboard focus', async ({ page }) => {
        const thumbs = page.getByTestId('range').getByRole('slider');

        await thumbs.nth(0).press(keyName[END]);
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '65');
        await page.getByRole('button', { name: 'Push', exact: true }).click();
        await expect(thumbs.nth(0)).toHaveAttribute('max', '90');
        await thumbs.nth(0).press(keyName[END]);
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '90');
        await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '100');
        await page.getByRole('button', { name: 'Swap', exact: true }).click();
        await expect(page.getByTestId('range')).toHaveAttribute('data-collision', 'swap');
        await thumbs.nth(1).press(keyName[HOME]);
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '0');
        await expect(thumbs.nth(0)).toBeFocused();
    });

    test('supports vertical input and read-only and disabled states', async ({ page }) => {
        const vertical = page.getByTestId('vertical');

        await vertical.click({ position: { x: 16, y: 10 } });
        await expect(vertical.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
        const readonly = page.getByTestId('readonly').getByRole('slider');

        await readonly.press(keyName[END]);
        await expect(readonly).toBeFocused();
        await expect(readonly).toHaveAttribute('aria-valuenow', '30');
        await expect(page.getByTestId('disabled').getByRole('slider')).toBeDisabled();
    });

    test('allows clicking a mark label and uses discrete keyboard steps', async ({ page }) => {
        const slider = page.getByTestId('marks');

        await slider.getByText('70', { exact: true }).click();
        await expect(slider.getByRole('slider')).toHaveAttribute('aria-valuenow', '70');
        await slider.getByRole('slider').press(keyName[LEFT_ARROW]);
        await expect(slider.getByRole('slider')).toHaveAttribute('aria-valuenow', '15');
    });

    test('opens a coincident range towards the clicked side', async ({ page }) => {
        const slider = page.getByTestId('coincident');
        const thumbs = slider.getByRole('slider');

        await slider.click({ position: { x: 300, y: 16 } });
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '50');
        await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '77');
    });

    test('selects a coincident thumb by the first drag movement', async ({ page }) => {
        const thumbs = page.getByTestId('coincident').getByRole('slider');
        const box = await thumbs.first().boundingBox();
        const x = box!.x + box!.width / 2;
        const y = box!.y + box!.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - 55, y, { steps: 4 });
        await page.mouse.up();
        await expect(thumbs.first()).toHaveAttribute('aria-valuenow', '35');
        await expect(thumbs.last()).toHaveAttribute('aria-valuenow', '50');
    });

    test('keeps each numeric editor clickable even directly above its thumb', async ({ page }) => {
        const hybrid = page.getByTestId('hybrid-range');
        const upper = hybrid.getByRole('spinbutton').last();

        await upper.click();
        await expect(upper).toBeFocused();
        await upper.fill('82');
        await upper.press(keyName[ENTER]);
        await expect(hybrid.getByRole('slider').last()).toHaveAttribute('aria-valuenow', '82');
    });

    test('updates pointer and keyboard direction after switching to RTL', async ({ page }) => {
        const slider = page.getByTestId('direction');
        const input = slider.getByRole('slider');

        await page.getByRole('button', { name: 'RTL', exact: true }).click();
        await expect(slider.locator('.kbq-slider__thumb')).toHaveAttribute('style', /70%/);
        await input.press(keyName[RIGHT_ARROW]);
        await expect(input).toHaveAttribute('aria-valuenow', '29');
        await slider.click({ position: { x: 14, y: 16 } });
        await expect(input).toHaveAttribute('aria-valuenow', '100');
    });

    test('synchronizes numeric input, slider, range and Angular reset', async ({ page }) => {
        const hybrid = page.getByTestId('hybrid');
        const input = hybrid.getByRole('spinbutton');

        await input.fill('42');
        await expect(hybrid.getByRole('slider')).toHaveAttribute('aria-valuenow', '42');
        await input.fill('');
        await input.press(keyName[TAB]);
        await expect(input).toHaveValue('42');
        await hybrid.getByRole('slider').press(keyName[END]);
        await expect(input).toHaveValue('100');
        const range = page.getByTestId('hybrid-range');

        await range.getByRole('spinbutton').nth(0).fill('99');
        await range.getByRole('spinbutton').nth(0).press(keyName[TAB]);
        await expect(range.getByRole('spinbutton').nth(0)).toHaveValue('75');
        const reactive = page.getByTestId('reactive').getByRole('slider');

        await reactive.press(keyName[END]);
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        await expect(reactive).toHaveAttribute('aria-valuenow', '35');
    });

    test('restores native fields and the two-way binding on reset', async ({ page }) => {
        const slider = page.getByTestId('native-slider').getByRole('slider');
        const hybrid = page.getByTestId('native-editor');
        const editor = hybrid.getByRole('spinbutton');
        const thumb = hybrid.getByRole('slider');

        await thumb.press(keyName[END]);
        await expect(editor).toHaveValue('100');
        await page.getByRole('button', { name: 'Reset native', exact: true }).click();

        await expect(page.getByTestId('native-value')).toHaveText('70');
        await expect(editor).toHaveValue('70');
        await expect(thumb).toHaveValue('70');
        await expect(slider).toHaveValue('70');
        await expect
            .poll(() =>
                page.getByTestId('native-form').evaluate((form) => [
                    ...new FormData(form as HTMLFormElement)
                ])
            )
            .toEqual([
                ['amount', '70'],
                ['limit', '70']
            ]);
    });

    for (const [buttonName, expected] of [
        ['Write 42', '42'],
        ['Reset current', '71']
    ] as const) {
        test(`keeps the form value after ${buttonName} cancels a thumb gesture`, async ({ page }) => {
            const hybrid = page.getByTestId('hybrid-reactive');
            const thumb = hybrid.getByRole('slider');

            await thumb.focus();
            await page.keyboard.down(keyName[RIGHT_ARROW]);
            await expect(thumb).toHaveValue('71');

            await page
                .getByRole('button', { name: buttonName, exact: true })
                .evaluate((button) => (button as HTMLButtonElement).click());
            await expect(thumb).toHaveValue(expected);
            await page.keyboard.press(keyName[ESCAPE]);
            await page.keyboard.up(keyName[RIGHT_ARROW]);
            await expect(thumb).toHaveValue(expected);
            await expect(hybrid.getByRole('spinbutton')).toHaveValue(expected);
        });
    }

    test('releases pointer capture when the slider value is written by its form', async ({ page }) => {
        const hybrid = page.getByTestId('hybrid-reactive');
        const thumb = hybrid.getByRole('slider');
        const editor = hybrid.getByRole('spinbutton');

        await editor.focus();
        await thumb.scrollIntoViewIfNeeded();
        const area = await thumb.boundingBox();
        const x = area!.x + area!.width / 2;
        const y = area!.y + area!.height / 2;

        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x - 30, y);
        await expect(hybrid.locator('kbq-slider')).toHaveClass(/kbq-slider_dragging/);
        await expect(hybrid.locator('.kbq-slider__thumb-shape')).toHaveCSS('opacity', '1', { pseudo: 'after' });
        await expect(editor).not.toBeFocused();
        await page
            .getByRole('button', { name: 'Write 42', exact: true })
            .evaluate((button) => (button as HTMLButtonElement).click());
        await expect(hybrid.locator('kbq-slider')).not.toHaveClass(/kbq-slider_dragging/);
        await page.mouse.move(x - 60, y);
        await page.mouse.up();
        await expect(thumb).toHaveValue('42');
        await expect(editor).toHaveValue('42');
    });

    test('uses the same stops in the numeric editor and clickable marks', async ({ page }) => {
        const hybrid = page.getByTestId('hybrid-marks');
        const editor = hybrid.getByRole('spinbutton');

        await editor.press(keyName[UP_ARROW]);
        await expect(editor).toHaveValue('15');
        await expect(hybrid.getByRole('slider')).toHaveValue('15');
        await hybrid.getByText('70', { exact: true }).click();
        await expect(editor).toHaveValue('70');
        await expect(hybrid.getByRole('slider')).toHaveValue('70');
    });

    test('keeps the tooltip 4 px from the visible thumb until focus leaves', async ({ page }) => {
        const range = page.getByTestId('range-tooltip');
        const thumb = range.getByRole('slider').first();
        const shape = range.locator('.kbq-slider__thumb-shape').first();

        await shape.scrollIntoViewIfNeeded();
        const area = await thumb.boundingBox();

        await page.mouse.move(area!.x + area!.width / 2, area!.y + area!.height / 2);
        await page.mouse.down();
        await page.mouse.move(area!.x + area!.width / 2 - 25, area!.y + area!.height / 2);
        await page.mouse.up();

        const tooltip = page.locator('.kbq-slider__tooltip');

        await expect(tooltip).toBeVisible();
        await expect
            .poll(async () => {
                const [body, label] = await Promise.all([shape.boundingBox(), tooltip.boundingBox()]);

                return Math.round(body!.y - label!.y - label!.height);
            })
            .toBe(4);
        await page.getByRole('button', { name: 'Write 42', exact: true }).focus();
        await expect(tooltip).toBeHidden();
    });
});
