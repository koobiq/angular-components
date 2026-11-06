# Tasks

## 1. Verification

- [ ] 1.1 Re-read the evidence for "Projected content is read as plain text": `readProjectedText` in `markdown.component.ts` lines 89-95 takes `textContent`; in `@angular/compiler` 21.2.25, `parseTemplate` runs `new WhitespaceVisitor(true, ...)` unless whitespace is preserved, and `processWhitespace` replaces only runs matching `[WS_CHARS]{2,}` in the decoded text value; verify the delta keeps a lone newline and drops blank lines and indentation
- [ ] 1.2 Re-read the evidence for "Default parser options": `parseToHtml` in `markdown.service.ts` line 21 calls the global `marked.parse`, and `marked` 17.0.3 merges the options over `this.defaults` of that instance, which `marked.use()` and `marked.setOptions()` change; verify the delta ties GitHub Flavored Markdown and the missing line break to unchanged defaults
- [ ] 1.3 Re-read the evidence for "HTML in the Markdown is not sanitized": `transform` in `markdown.service.ts` lines 27-33 inserts the alias `class` right after the tag name, and both snapshots in `__snapshots__/markdown.component.spec.ts.snap` show the `bash` code block without its `language-bash` class; verify the delta names the shadowed `class` attribute as the exception
- [ ] 1.4 Re-read the evidence for "Tables": `th` is aliased only by `<th\s*>` (`markdown.service.ts` lines 35-42), and the snapshots (lines 342-360 and 749-767) show the aligned header cells with `align` and no class; verify the delta limits `kbq-markdown__th` to header cells of columns without alignment
- [ ] 1.5 Re-read the evidence for "Line break with two trailing spaces": the hard-break rule of `marked` 17.0.3 is `/^( {2,}|\\)\n(?!\s*$)/`, so nothing follows at the end of a paragraph, and the compiler collapses the decoded `&#32;&#32;` and the newline into one space unless whitespace is preserved; verify the delta states both conditions and keeps the scenario, which the inline-template snapshot (lines 241-247) backs
- [ ] 1.6 Re-read the evidence for "Parsing service": `parseToHtml` casts the result of `marked.parse` to `string` (`markdown.service.ts` line 21), `marked` returns a promise when `async` is on, and `transform` then calls `replace` on it (line 28); verify the delta states the `TypeError`
- [ ] 1.7 Run `openspec validate correct-markdown-baseline --strict` and verify it reports the change as valid

## Workflow follow-up

- Archive the change with /opsx:archive.
