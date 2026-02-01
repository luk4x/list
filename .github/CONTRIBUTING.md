# Contributing

Thanks for your interest in contributing to `@luk4x/list`.

This project is intentionally small and opinionated. Please read this document carefully before opening an issue or pull request.

---

## Project scope

This component exists to solve **one specific problem**:

> Rendering lists in React with correct, stable keys and minimal boilerplate, without hiding React’s behavior.

Because of that, this project values:

- **Correctness over convenience** (especially around stable keys)
- **failing loudly over silent fallbacks**
- **Minimal API surface**
- **Strong typing**
- **Clear docs**

If a proposed change compromises any of these principles, it’s unlikely to be accepted.

### Proposing changes

Please do **not** propose changes that:

- add styling, layout, or visual concerns
- introduce silent fallbacks as a workaround in case of failure
- attempt to “fix” unstable or poorly modeled data
- hide React’s behavior
- expand the API surface beyond its current scope

Contributions are very welcome when:

- fix bugs or edge cases related to key handling
- improve type safety without increasing API complexity
- improve documentation clarity or examples
- add tests that validate existing behavior
- clarify error messages or developer feedback

### Issues and feature requests

When opening an issue, please include:

- What you’re trying to do
- Expected behavior
- Actual behavior
- A minimal code example

---

## Project environment

The project is a **CLI** that prompts for a destination path and copies the `templates/list` component into a user’s codebase.

Therefore, the changes should be tested through the CLI itself as well, and not just through tests.

### Folder structure

```

├─ .github/                 # GitHub metadata
├─ .husky/                  # Git hooks
├─ dist/                    # Build output (generated)
├─ src/                     # CLI source
├─ templates                # Component templates shipped by the CLI
├─ tests/                   # Runtime and type tests
├─ index.d.ts               # Root type exports for tsd
├─ tsup.config.ts           # Build config
└─ vitest.config.ts         # Test config

```

### Requirements

- Node.js >= 18 (recommended via NVM)
- pnpm

### Tooling and conventions

This project uses the following tools and conventions:

- [@changesets/cli](https://www.npmjs.com/package/@changesets/cli) for versioning and releases
- [Conventional Commits](https://www.conventionalcommits.org) for commit messages
- [Vitest](https://vitest.dev/) and [tsd](https://www.npmjs.com/package/tsd) for testing

### Main scripts

```bash

pnpm install        # install dependencies
nvm install         # install Node.js version from .nvmrc
pnpm run dev        # build and run the CLI locally
pnpm run typecheck  # run TypeScript checks (runs on every commit)
pnpm run lint       # run ESLint (runs on every commit)
pnpm run test:all   # run runtime and type tests (runs on every commit)
pnpm run build      # build the CLI with tsup (runs on every push)

```

### Recommended CLI local testing workflow

Because this is a CLI that copies templates into real projects, the most reliable way to test changes is to run it against a fresh test project.

Create a temporary test project:

```bash

mkdir -p /tmp/list-test && cd /tmp/list-test && pnpm init

```

From inside that project, run the CLI directly from your local build (replace the path accordingly):

```bash

node /absolute/path/to/list-repo/dist/cli.mjs

```

This simulates how real users interact with the CLI and helps catch issues that unit tests alone may miss (path resolution, prompts, file output, etc.). Changes that affect the CLI or templates should always be tested this way before opening a pull request.
