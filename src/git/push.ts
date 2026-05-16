import simpleGit, { type SimpleGit } from "simple-git";
import {
	FileSystemAdapter,
	normalizePath,
	Notice,
	Plugin,
	type Vault,
} from "obsidian";

let pushInProgress = false;

const PUSH_REMOTE = "origin";
const PUSH_BRANCH = "main";

const DEFAULT_GITIGNORE = `# Default .gitignore created by Simple Git on first sync. Customize as needed.
.obsidian/workspace
.obsidian/workspace.json
.obsidian/workspaces.json
.obsidian/workspace-mobile.json
.Trash/

# OS · macOS
.DS_Store
.AppleDouble
.LSOverride
._*

# OS · Windows
Thumbs.db
ehthumbs.db
Desktop.ini
desktop.ini

# OS · Linux (and cross-platform editor temp files)
.directory
*~
*.swp
*.swo
`;

async function ensureDefaultGitignore(vault: Vault): Promise<boolean> {
	const rel = normalizePath(".gitignore");
	if (
		vault.getAbstractFileByPath(rel) !== null ||
		(await vault.adapter.exists(rel))
	) {
		return false;
	}
	await vault.create(rel, DEFAULT_GITIGNORE);
	return true;
}

function formatDate(date: Date): string {
	const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
	return (
		`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
		`${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
	);
}

/**
 * Stage all changes, commit if anything is staged, then push to origin main. No pull or fetch.
 */
export async function pushVaultToRemote(plugin: Plugin): Promise<void> {
	if (pushInProgress) {
		new Notice("Push already in progress.");
		return;
	}

	pushInProgress = true;
	try {
		const { adapter } = plugin.app.vault;
		if (!(adapter instanceof FileSystemAdapter)) {
			new Notice("Push only works with a local folder vault.");
			return;
		}

		const basePath = adapter.getBasePath();
		const git: SimpleGit = simpleGit(basePath);

		const isRepo = await git.checkIsRepo();
		if (!isRepo) {
			new Notice("Not a Git repository.");
			return;
		}

		const abbrevRef = (await git.revparse(["--abbrev-ref", "HEAD"])).trim();
		if (abbrevRef === "HEAD") {
			new Notice("Push skipped: detached head. Checkout branch main.");
			return;
		}
		if (abbrevRef !== PUSH_BRANCH) {
			new Notice(
				`Push only runs on branch ${PUSH_BRANCH}. Currently on ${abbrevRef}.`
			);
			return;
		}

		const message = `Update: ${formatDate(new Date())}`;

		if (await ensureDefaultGitignore(plugin.app.vault)) {
			new Notice("Created default .gitignore.");
		}

		await git.add(".");
		const stagedList = await git.raw(["diff", "--cached", "--name-only"]);
		const hasStaged = stagedList.trim().length > 0;
		if (!hasStaged) {
			const st = await git.status();
			const tracking = st.tracking;
			const hasUpstream =
				typeof tracking === "string" && tracking.trim().length > 0;
			if (hasUpstream && (st.ahead ?? 0) === 0) {
				new Notice("Nothing changed.");
				return;
			}
		}

		new Notice("Push started.");

		if (hasStaged) {
			await git.commit(message);
		}

		await git.push(PUSH_REMOTE, PUSH_BRANCH);
		new Notice("Git push completed.");
	} catch (e) {
		const detail = e instanceof Error ? e.message : String(e);
		new Notice(`Git push failed: ${detail}`);
	} finally {
		pushInProgress = false;
	}
}
