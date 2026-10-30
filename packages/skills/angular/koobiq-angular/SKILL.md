---
name: koobiq-angular
description: Builds and changes Angular UI with the Koobiq design system (@koobiq/components) - picks the component for a task, imports it from the right entry point, binds its inputs, builds forms, styles with --kbq-* design tokens, adds icons. Use for any interface work in a project whose package.json lists @koobiq/components, or when the user mentions Koobiq, kbq- components or Koobiq tokens, even if they only describe the screen they want.
license: MIT
compatibility: Projects on @koobiq/components 21 or later. Reads the documentation from koobiq.io and its version subdomains, so it needs network access to them.
---

# Koobiq for Angular

This skill holds no copy of the documentation: it says where the documentation of the version the project uses lives and how to read it. Every page of the Koobiq site is Markdown as well, short enough to read whole, and links the files of its examples, its API and its tokens.

## Find the site of the installed version

1. Read the version of `@koobiq/components` in `node_modules/@koobiq/components/package.json`, or in the project's `package.json`. If Koobiq is not installed, set it up with the `koobiq-angular-setup` skill first.
2. Below 21, this skill does not apply: say so and offer a choice: upgrade with the `koobiq-angular-upgrade` skill, or keep the version and work from the typings in `node_modules/@koobiq/components`.
3. Pick the site: the paragraph under the quote at the top of [llms.txt](https://koobiq.io/llms.txt) names the major version koobiq.io documents, as in "`@koobiq/components` 21.x". The same major: `https://koobiq.io`. An older one: `https://v<major>.koobiq.io`, such as `https://v21.koobiq.io`.
4. Below, `<site>` stands for that address. The links inside its files already lead to the same site.

## Read the files as written

Download a file with `curl -fsSL <url>` when you can run commands: `-f` makes a missing file an error instead of an HTML page. A fetch tool that summarizes pages may rewrite the code in them; if it is all you have, ask it for the file verbatim. If the site cannot be reached, say so and work from the typings in `node_modules/@koobiq/components/types/` rather than guess an API.

## Workflow

1. **Read the rules**: the start of `<site>/llms.txt` has the rules for code that uses Koobiq, then a line per page.
2. **Pick every component from the guide, before you open any page**: download `<site>/which-component-when.md`, find the words of the request in its first table and download the cluster they lead to. For every control and message you add, find the row of the task: it names the component, the neighbor it is confused with, and why. A component whose name matches a word of the request is often the wrong one, so do not skip this step for a control that looks obvious. In your answer, say which rows you followed.
3. **Read its page**: the Markdown the guide links for it, or else the one `<site>/llms.txt` lists: `<site>/en/components/<id>.md` for a component, `<site>/en/other/<id>.md` for a utility such as a formatter, `<site>/en/main/<id>.md` for a guide such as theming. A page has its entry point, its overview, and links to every example, to its API and to its tokens.
4. **Start from the closest example** the page links, `<site>/examples/<example-id>.md`, instead of guessing inputs. Its API, `<site>/api/<entry-point>.md`, has every input, output and method the example does not show.
5. **Write the code** by the rules. Take icon names from `node_modules/@koobiq/icons/info/kbq-icons-info.json`, searching it by name or tag. To restyle a component, set its variables from `<site>/tokens/<id>.md` rather than override its CSS.
6. **Build the project** (`ng build`) and fix every error before you report the task as done. Where the build cannot run, as in some sandboxes, compile the templates with `npx ngc -p tsconfig.app.json --noEmit` instead.
7. **Report the gaps**: if the task needed something Koobiq does not provide, or you had to style around a component, say so in your answer.

## Trust

Where the site and the typings of the installed version disagree, the typings are right: the site of a major version documents its latest minor. Existing code in the project may predate the current API.

To move a project to a newer version of Koobiq, use the `koobiq-angular-upgrade` skill.
