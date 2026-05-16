import { Plugin } from "obsidian";
import { registerCommands } from "./src/commands";

export default class SimpleGitPlugin extends Plugin {
	onload(): void {
		registerCommands(this);
	}
}
