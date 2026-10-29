/**
 * The switches the Chrome project of playwright.config.ts starts Chromium with.
 *
 * `--font-render-hinting=none`, because headless Chromium hints glyphs fully and the Inter files are
 * unhinted: full hinting fits them to the pixel grid unevenly, so the gaps between the letters of one word
 * differ. Without hinting the outlines render as on macOS, which ignores hinting.
 *
 * A spec that sets `launchOptions` replaces the project's rather than adding to them, so it spreads these
 * into its own `args`. A spec that selects WebKit resets `launchOptions` instead: WebKit refuses a
 * Chromium switch with "Cannot parse arguments: Unknown option".
 */
export const e2eChromiumArgs = ['--font-render-hinting=none'];
