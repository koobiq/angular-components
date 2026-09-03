# markdown-signals

Migration schematic invoked automatically by `ng update @koobiq/components@20` (registered for
`20.3.0-0`). Migrates `KbqMarkdown` consumers to its signal-based API and reports the two behavior
fixes the review made.

## Background

`markdownText` was the component's only input, and its setter did the rendering — which is why the
automated signal migration skipped it:

```ts
set markdownText(value: string | null) {
    if (value && this.markdownText !== value) {
        this.resultHtml.set(this.getResultHTML(value));
    }
    this._markdownText = value;
}
```

The rendered HTML is a `computed` now and the input is a plain `input()`.

## What it rewrites

| Before                  | After                     |
| ----------------------- | ------------------------- |
| `markdown.markdownText` | `markdown.markdownText()` |

Both on receivers explicitly typed `KbqMarkdown` and through template reference variables on
`<kbq-markdown>`, in external and inline templates. Already-migrated reads are left alone, so the
schematic is idempotent.

## What it does _not_ do

| Pattern                           | Manual migration                                               |
| --------------------------------- | -------------------------------------------------------------- |
| `markdown.markdownText = …`       | Bind `[markdownText]` in the template — the input is read-only |
| `resultHtml.set(…)` in a subclass | Now a read-only `computed` — feed `markdownText` instead       |
| `viewChild(KbqMarkdown)`          | The query returns the instance, so a read is a double call     |

## Notes with no call site to point at

Both are consequences of the `if (value && …)` guard in the old setter.

- **Clearing `markdownText` now clears the output.** The setter only re-rendered for a truthy value,
  so setting it back to `null` or `''` left the previous HTML on screen indefinitely.
- **The projected content is a standing fallback.** A `<kbq-markdown>` that both projects content and
  binds `[markdownText]` falls back to the projected content whenever the input is empty, not just at
  first render. The projected text itself is still captured once, after the first render — changing
  it later still does not re-render.

## Running it manually

```
ng generate @koobiq/components:markdown-signals --project my-app
```

Pass `--fix=false` to see what it would change without writing.
