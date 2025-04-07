import * as vscode from "vscode";
import * as path from "path";
import { SortableExplorerProvider } from "../SortableExplorerProvider";
import { ConfigurationManager } from "../../configuration/configurationManager";
import { localize } from "../../localization/localization";
import { FileItem } from "../FileItem";

export function addToExcludePatternsCommand(
  fileExplorerProvider: SortableExplorerProvider
) {
  return async (fileItem: FileItem) => {
    if (!fileItem) {
      return;
    }

    // 現在のexcludePatternsを取得
    const currentPatterns = ConfigurationManager.getExcludePatterns();

    // ワークスペースフォルダを取得
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders) {
      return;
    }

    // ファイルパスをワークスペースからの相対パスに変換
    let relativePath = "";
    for (const folder of workspaceFolders) {
      const relPath = path.relative(folder.uri.fsPath, fileItem.filePath);
      if (!relPath.startsWith("..")) {
        relativePath = relPath;
        break;
      }
    }

    if (!relativePath) {
      return;
    }

    // フォルダかファイルかを判断し、適切なパターンを生成
    let pattern = "";
    if (fileItem.isDirectory) {
      // フォルダの場合は **/<フォルダ名>/** パターンを生成
      const folderName = path.basename(fileItem.filePath);
      pattern = `**/${folderName}/**`;
    } else {
      // ファイルの場合は **/<ファイルパス> パターンを生成
      pattern = `**/${relativePath}`;
    }

    // パターンが既に存在するかチェック
    if (currentPatterns.includes(pattern)) {
      vscode.window.showInformationMessage(
        localize("addToExcludePatterns.alreadyExists", pattern)
      );
      return;
    }

    // 新しいパターンを追加
    const updatedPatterns = [...currentPatterns, pattern];

    // 設定を更新
    await ConfigurationManager.setExcludePatterns(updatedPatterns);

    // ファイルエクスプローラーを更新
    fileExplorerProvider.refresh();

    // 成功メッセージを表示
    vscode.window.showInformationMessage(
      localize("addToExcludePatterns.added", fileItem.name)
    );
  };
}
