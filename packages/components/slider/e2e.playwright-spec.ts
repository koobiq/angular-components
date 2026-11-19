import { expect, test } from '@playwright/test';
import { e2eEnableDarkTheme } from '../../e2e/utils';

test.describe('Slider', () => {
    test.beforeEach(async ({ page }, testInfo) => {
        if (testInfo.title !== 'states and appearance') await page.goto('/E2eSliderInteraction');
    });

    test('states and appearance', async ({ page }) => {
        await page.goto('/E2eSliderStateAndStyle');
        const target = page.getByTestId('e2eScreenshotTarget');

        await page.mouse.move(1100, 700);
        await expect(target).toHaveScreenshot('01-light.png');
        await e2eEnableDarkTheme(page);
        await expect(target).toHaveScreenshot('01-dark.png');
    });

    test('supports track clicks and one commit for keyboard repeat', async ({ page }) => {
        const slider = page.getByTestId('single');
        const input = slider.getByRole('slider');

        await slider.click({ position: { x: 300, y: 16 } });
        await expect(input).toHaveAttribute('aria-valuenow', '77');
        await expect(page.getByTestId('commits')).toHaveText('1');
        await input.focus();
        await page.keyboard.down('ArrowRight');
        await page.keyboard.down('ArrowRight');
        await page.keyboard.down('ArrowRight');
        await expect(input).toHaveAttribute('aria-valuenow', '80');
        await expect(page.getByTestId('commits')).toHaveText('1');
        await page.keyboard.up('ArrowRight');
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

        await thumbs.nth(0).press('End');
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '65');
        await page.getByRole('button', { name: 'Push', exact: true }).click();
        await expect(thumbs.nth(0)).toHaveAttribute('max', '90');
        await thumbs.nth(0).press('End');
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '90');
        await expect(thumbs.nth(1)).toHaveAttribute('aria-valuenow', '100');
        await page.getByRole('button', { name: 'Swap', exact: true }).click();
        await expect(page.getByTestId('range')).toHaveAttribute('data-collision', 'swap');
        await thumbs.nth(1).press('Home');
        await expect(thumbs.nth(0)).toHaveAttribute('aria-valuenow', '0');
        await expect(thumbs.nth(0)).toBeFocused();
    });

    test('supports vertical input and read-only and disabled states', async ({ page }) => {
        const vertical = page.getByTestId('vertical');

        await vertical.click({ position: { x: 16, y: 10 } });
        await expect(vertical.getByRole('slider')).toHaveAttribute('aria-valuenow', '100');
        const readonly = page.getByTestId('readonly').getByRole('slider');

        await readonly.press('End');
        await expect(readonly).toBeFocused();
        await expect(readonly).toHaveAttribute('aria-valuenow', '30');
        await expect(page.getByTestId('disabled').getByRole('slider')).toBeDisabled();
    });

    test('allows clicking a mark label and uses discrete keyboard steps', async ({ page }) => {
        const slider = page.getByTestId('marks');

        await slider.getByText('70', { exact: true }).click();
        await expect(slider.getByRole('slider')).toHaveAttribute('aria-valuenow', '70');
        await slider.getByRole('slider').press('ArrowLeft');
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
        await upper.press('Enter');
        await expect(hybrid.getByRole('slider').last()).toHaveAttribute('aria-valuenow', '82');
    });

    test('updates pointer and keyboard direction after switching to RTL', async ({ page }) => {
        const slider = page.getByTestId('direction');
        const input = slider.getByRole('slider');

        await page.getByRole('button', { name: 'RTL', exact: true }).click();
        await expect(slider.locator('.kbq-slider__thumb')).toHaveAttribute('style', /70%/);
        await input.press('ArrowRight');
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
        await input.press('Tab');
        await expect(input).toHaveValue('42');
        await hybrid.getByRole('slider').press('End');
        await expect(input).toHaveValue('100');
        const range = page.getByTestId('hybrid-range');

        await range.getByRole('spinbutton').nth(0).fill('99');
        await range.getByRole('spinbutton').nth(0).press('Tab');
        await expect(range.getByRole('spinbutton').nth(0)).toHaveValue('75');
        const reactive = page.getByTestId('reactive').getByRole('slider');

        await reactive.press('End');
        await page.getByRole('button', { name: 'Reset', exact: true }).click();
        await expect(reactive).toHaveAttribute('aria-valuenow', '35');
    });
});
