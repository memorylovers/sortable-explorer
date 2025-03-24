import * as vscode from "vscode";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { FileSystemHelper } from "../fileExplorer/fileSystemHelper";
import { localize } from "../localization/localization";

// 新規ノート作成コマンド
export function createNewNoteCommand(
  fileExplorerProvider: FileExplorerProvider,
  fileSystemHelper: FileSystemHelper
) {
  return async () => {
    try {
      // ワークスペースフォルダの確認
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage(localize('newNote.noWorkspace'));
        return;
      }

      // タイトル入力ダイアログを表示
      const title = await vscode.window.showInputBox({
        prompt: localize('newNote.placeholder'),
        placeHolder: localize('command.createNewNote.title'),
      });

      // キャンセルされた場合
      if (title === undefined) {
        return;
      }

      // タイトルが空の場合
      if (title.trim() === "") {
        vscode.window.showErrorMessage(localize('newNote.emptyTitle'));
        return;
      }

      // 最初のワークスペースフォルダを使用
      const workspacePath = workspaceFolders[0].uri.fsPath;

      // ノートファイルを作成
      const filePath = await fileSystemHelper.createNewNote(
        workspacePath,
        title
      );

      // 作成したファイルを開く
      const document = await vscode.workspace.openTextDocument(filePath);
      await vscode.window.showTextDocument(document);

      // ファイルエクスプローラーを更新
      fileExplorerProvider.refresh();

      vscode.window.showInformationMessage(
        localize('newNote.created', title)
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        localize('newNote.error') + `: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
}
