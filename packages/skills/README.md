# Koobiq Agent Skills

[Agent Skills](https://agentskills.io) for the [Koobiq](https://koobiq.io) design system, for AI coding agents such as Claude Code, Codex, Cursor or GitHub Copilot.

| Skill                    | Use it for                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| `koobiq-angular-setup`   | Adding Koobiq to an Angular project: `ng add`, styles, theme, locale and fonts                    |
| `koobiq-angular`         | Building UI with `@koobiq/components`: choosing a component, its API and examples, theming, icons |
| `koobiq-angular-upgrade` | Upgrading a project to a new version of Koobiq with `ng update` and the manual steps it leaves    |

Install a skill with the [GitHub CLI](https://cli.github.com), which downloads only the files of that skill:

```bash
gh skill install koobiq/angular-components angular/koobiq-angular
```

Or with the [skills CLI](https://github.com/vercel-labs/skills), which may clone the whole repository first:

```bash
npx skills add koobiq/angular-components/packages/skills
```

The skills hold no copy of the documentation: they read the Markdown the documentation site serves for agents, from the site of the version a project uses (`koobiq.io` or `v<major>.koobiq.io`), so they follow every change to a component without being edited. They work with Koobiq 21 and later. See the [AI agents guide](https://koobiq.io/en/main/ai-agents/overview) for installing them and the network access they need.
