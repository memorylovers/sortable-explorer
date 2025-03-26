import * as vscode from "vscode";

// ブックマークビューを表示するコマンド
export function showBookmarkViewCommand() {
  return async () => {
    // ブックマークビューを表示
    await vscode.commands.executeCommand("workbench.view.extension.sortable-explorer");
    await vscode.commands.executeCommand("workbench.view.extension.sortable-explorer.bookmarks.focus");
  };
}