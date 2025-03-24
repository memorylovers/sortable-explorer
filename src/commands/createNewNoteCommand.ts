import * as path from "path";
import * as vscode from "vscode";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { FileItem } from "../fileExplorer/fileItem";
import { FileSystemHelper } from "../fileExplorer/fileSystemHelper";
import { localize } from "../localization/localization";

// 新規ノート作成コマンド
export function createNewNoteCommand(
  fileExplorerProvider: FileExplorerProvider,
  fileSystemHelper: FileSystemHelper
) {
  return async (fileItem?: FileItem) => {
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

      // 作成先のディレクトリを決定
      let targetDirectory: string;

      if (fileItem) {
        // FileItemが指定されている場合（コンテキストメニューから呼び出された場合）
        if (fileItem.isDirectory) {
          // フォルダが選択されている場合、そのフォルダ内に作成
          targetDirectory = fileItem.filePath;
        } else {
          // ファイルが選択されている場合、そのファイルと同じフォルダに作成
          targetDirectory = path.dirname(fileItem.filePath);
        }
      } else if (vscode.window.activeTextEditor) {
        // アクティブなエディタがある場合、そのファイルと同じフォルダに作成
        const activeFilePath = vscode.window.activeTextEditor.document.uri.fsPath;
        targetDirectory = path.dirname(activeFilePath);
      } else {
        // それ以外の場合は最初のワークスペースフォルダを使用
        targetDirectory = workspaceFolders[0].uri.fsPath;
      }

      // ノートファイルを作成
      const filePath = await fileSystemHelper.createNewNote(
        targetDirectory,
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
