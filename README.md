# Simple Git

Push-only: stage the vault, commit when there are changes, then `git push origin main`. No pull or fetch.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/imaikosuke/obsidian-simple-git/releases)
[![Obsidian Plugin](https://img.shields.io/badge/Obsidian-Plugin-7c3aed.svg)](https://obsidian.md)

## Prerequisites

- Desktop **folder vault**. This plugin never runs `git init` or `git remote add` for you.
- Remote **`origin`**, branch **`main`**. Remote URL is the usual SSH form: `git@github.com:USER/REPO.git`.
- **`git push` from the vault root works** once (credentials, SSH agent, upstream). If unsure: `ssh -T git@github.com` then `git ls-remote origin`.

If `.gitignore` is missing in the vault, the first sync drops in a minimal Obsidian + OS-crud template — edit freely. Untracked files only; tracked paths stay tracked until `git rm --cached`.

## Setup (vault root terminal; not `.obsidian/`)

### Repo already cloned

Check `origin` and `main` (`git remote -v`, `git branch --show-current`). If you still want `master` locally, reconcile with `main` yourself; pushes always target **`main`**.

### New repo layout

From the vault root:

```bash
git init -b main
git remote add origin git@github.com:USER/REPO.git
```

Empty GitHub repo: first push once (upstream), then rely on the plugin.

```bash
git add .
git commit -m "Initial commit"
git push -u origin main
```

## Usage

Stay on **`main`**, then the ribbon icon or command **Sync GitHub**.

## License

MIT
