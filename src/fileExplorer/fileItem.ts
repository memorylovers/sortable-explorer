import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";

export class FileItem extends vscode.TreeItem {
  constructor(
    public readonly name: string,
    public readonly filePath: string,
    public readonly modifiedTime: Date,
    public readonly createdTime: Date,
    public readonly resourceUri: vscode.Uri,
    public readonly isDirectory: boolean = false,
    public readonly parent?: FileItem
  ) {
    super(
      resourceUri,
      isDirectory
        ? vscode.TreeItemCollapsibleState.Collapsed
        : vscode.TreeItemCollapsibleState.None
    );
    
    if (!isDirectory) {
      this.description = this.getRelativeFolderPath();
      this.command = {
        command: "vscode.open",
        title: "Open File",
        arguments: [resourceUri],
      };
    }
    
    // アイコンの設定
    this.iconPath = isDirectory
      ? new vscode.ThemeIcon("folder")
      : new vscode.ThemeIcon("file");
  }

  private getRelativeFolderPath(): string {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return path.dirname(this.filePath);
    }

    for (const folder of workspaceFolders) {
      const relativePath = path.relative(folder.uri.fsPath, this.filePath);
      if (!relativePath.startsWith("..")) {
        // ファイルパスからディレクトリパスを取得
        const directoryPath = path.dirname(relativePath);
        // 一番親のフォルダを表示しないように修正
        const pathParts = directoryPath.split(path.sep);
        if (pathParts.length <= 1) {
          return directoryPath;
        }

        return path.join(...pathParts.slice(1));
      }
    }

    return path.dirname(this.filePath);
  }
}
