# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Slot templates are registered by name": `parseSlots` in `dynamic-translation.ts` line 104 joins the registered names into `new RegExp(...)` without escaping them; verify that a name `a.b` also matches `[[axb]]`, whose template lookup on line 119 gives `null`, and that a name `a(` makes the `RegExp` constructor throw a `SyntaxError` for any text
- [ ] 1.2 Re-read the evidence for "Where a context ends": line 120 passes `listString.split(',')` instead of the context when the context matches `^\((.*?)\)$` on line 110 with something between the parentheses; verify the delta excepts the list form
- [ ] 1.3 Re-read the evidence for "Unknown names and malformed markers stay text": with no slot registered, line 104 builds `\[\[()(?::(.+?))?\]\]`, which matches `[[]]` and `[[:context]]`, and the `null` template from line 119 renders nothing; verify the "No slot registered" scenario
- [ ] 1.4 Re-read the evidence for "Helper renders plain elements for markers": line 149 binds `slot.content || content`, so an empty `content` falls back to the context, and an `undefined` value leaves out `data-slot-content`; lines 180-184 then pass `null` from `getAttribute` to `createText`, which renders the text `null`; verify the "Neither content nor context" scenario
- [ ] 1.5 Re-read the evidence for "Helper creates its elements once": `afterNextRender` on lines 172-174 runs `replaceSlots` once, while the template on lines 142-154 keeps rendering a placeholder `span` for every new slot view; verify the "Text changed after the first render" scenario
- [ ] 1.6 Run `openspec validate correct-dynamic-translation-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
