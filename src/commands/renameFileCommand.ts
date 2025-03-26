import * as path from "path";
import * as vscode from "vscode";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

// ファイル名変更コマンド
export function renameFileCommand(
  fileExplorerProvider: FileExplorerProvider
) {
  return async (fileItem: any) => {
    try {
      if (!fileItem || !fileItem.resourceUri) {
        vscode.window.showErrorMessage(
          localize('renameFile.noSelection')
        );
        return;
      }

      // ディレクトリの場合は処理しない
      if (fileItem.isDirectory) {
        return;
      }

      const sourceUri = fileItem.resourceUri;
      const sourceFilePath = sourceUri.fsPath;
      const sourceFileName = path.basename(sourceFilePath);
      const sourceDir = path.dirname(sourceFilePath);
      
      // ユーザーに新しいファイル名を入力してもらう
      const newFileName = await vscode.window.showInputBox({
        prompt: localize('renameFile.prompt'),
        value: sourceFileName,
        validateInput: (value) => {
          // 入力値の検証
          if (!value) {
            return localize('renameFile.emptyName');
          }
          return null;
        }
      });
      
      if (!newFileName) {
        return; // ユーザーがキャンセルした場合
      }
      
      const targetFilePath = path.join(sourceDir, newFileName);
      const targetUri = vscode.Uri.file(targetFilePath);
      
      // 同名ファイルの存在チェック
      try {
        await vscode.workspace.fs.stat(targetUri);
        // ファイルが存在する場合
        vscode.window.showErrorMessage(localize('renameFile.alreadyExists', newFileName));
        return;
      } catch {
        // ファイルが存在しない場合は問題なし、続行
      }
      
      // ファイル名変更
      await vscode.workspace.fs.rename(sourceUri, targetUri, { overwrite: false });
      
      // ファイルエクスプローラーを更新
      fileExplorerProvider.refresh();
      
      vscode.window.showInformationMessage(
        localize('renameFile.renamed', sourceFileName, newFileName)
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        localize('renameFile.error') + `: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  };
}