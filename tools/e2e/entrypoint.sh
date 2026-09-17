#!/bin/sh
# Entrypoint of the e2e image: runs the container command, then copies Playwright's output directory
# back into the bind-mounted test-results.
#
# playwright.config.ts writes per-test artifacts to PLAYWRIGHT_OUTPUT_DIR, which the compose file
# points at a container-local path. A trace records a few dozen file operations per test — and the
# browser context waits for them to flush before the test can end — while /app/test-results is a bind
# mount that on a Windows host goes through 9P. Keeping the writes local and copying the result once
# keeps `test-results/<test>/trace.zip` on the host exactly where docs/guides/06-testing.md says it is.
#
# Playwright empties its output directory when a run starts, so the mount is emptied the same way
# before the copy. A run interrupted with Ctrl+C never reaches the copy; the HTML report under
# playwright-report is written by Playwright itself and does not depend on this step.
set -u

"$@"
status=$?

if [ -n "${PLAYWRIGHT_OUTPUT_DIR:-}" ] && [ -d "$PLAYWRIGHT_OUTPUT_DIR" ] && [ -d /app/test-results ]; then
    find /app/test-results -mindepth 1 -delete
    cp -a "$PLAYWRIGHT_OUTPUT_DIR"/. /app/test-results/
fi

exit "$status"
