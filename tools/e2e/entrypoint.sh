#!/bin/sh
# Entrypoint of the e2e image: runs the container command, then copies Playwright's output into the
# bind mounts under /host.
#
# The host directories are mounted beside the ones Playwright writes to rather than over them, so
# both the per-test artifacts and the HTML report are produced on the image's own filesystem. A
# mount is slow to write to twice over: on a Windows host it goes through 9P, and the reporter's
# wipe of its own output directory retries for seconds against the EBUSY that a bind-mount point
# always returns. Copying once at the end keeps `test-results/<test>/trace.zip` and
# `playwright-report` on the host where docs/guides/06-testing.md says they are, and keeps the paths
# Playwright prints on a failure relative to the same place.
#
# The mounts are emptied before the command rather than after, so a run that dies without producing
# anything cannot leave the previous run's artifacts looking like its own.
set -u

for name in test-results playwright-report; do
    [ -d "/host/$name" ] && find "/host/$name" -mindepth 1 -delete
done

# Signals arrive here and not at the command: this shell is the container's main process, and tini
# signals only its direct child. Forwarding keeps `docker compose stop` and Ctrl+C stopping the run,
# and leaves the copy below reachable.
child=''
trap '[ -n "$child" ] && kill -TERM "$child" 2>/dev/null' INT TERM

# Stdin duplicated onto another descriptor first: a background command in a non-interactive shell is
# given /dev/null, and `<&0` would only re-copy that. Explicit `<&3` overrides it.
exec 3<&0
"$@" <&3 &
child=$!

# A trapped signal interrupts `wait` before the command has finished stopping; wait again while it
# is still alive, so the status reported is its own rather than the interruption's.
wait "$child"
status=$?

while kill -0 "$child" 2> /dev/null; do
    wait "$child"
    status=$?
done

for name in test-results playwright-report; do
    [ -d "/app/$name" ] && [ -d "/host/$name" ] && cp -a "/app/$name"/. "/host/$name"/
done

exit "$status"
