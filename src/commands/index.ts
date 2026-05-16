import { Plugin } from "obsidian";
import { pushVaultToRemote } from "../git/push";

export function registerCommands(plugin: Plugin): void {
	plugin.addRibbonIcon("github", "Sync GitHub", () => {
		void pushVaultToRemote(plugin);
	});

	plugin.addCommand({
		id: "push-changes",
		name: "Sync GitHub",
		callback: () => {
			void pushVaultToRemote(plugin);
		},
	});
}
