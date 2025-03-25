import * as path from "path";
import * as vscode from "vscode";
import * as fs from "fs";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

// ファイルコピーコマンド
export function copyFileCommand(
  fileExplorerProvider: FileExplorerProvider
) {
  return async (fileItem: any) => {
    try {
      if (!fileItem || !fileItem.resourceUri) {
        vscode.window.showErrorMessage(
          localize('copyFile.noSelection')
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
      
      // 新しいファイル名を生成（例: file.txt -> file - Copy.txt）
      const fileExt = path.extname(sourceFileName);
      const fileNameWithoutExt = path.basename(sourceFileName, fileExt);
      
      // 重複しないファイル名を生成
      let newFileName = `${fileNameWithoutExt} - Copy${fileExt}`;
      let targetFilePath = path.join(sourceDir, newFileName);
      let counter = 2;
      
      // ファイルが既に存在する場合は連番を付ける
      while (fs.existsSync(targetFilePath)) {
        newFileName = `${fileNameWithoutExt} - Copy (${counter})${fileExt}`;
        targetFilePath = path.join(sourceDir, newFileName);
        counter++;
      }
      
      const targetUri = vscode.Uri.file(targetFilePath);

      // ファイルの内容を読み込む
      const fileData = await vscode.workspace.fs.readFile(sourceUri);
      
      // 新しいファイルに書き込む
      await vscode.workspace.fs.writeFile(targetUri, fileData);

      // ファイルエクスプローラーを更新
      fileExplorerProvider.refresh();

      vscode.window.showInformationMessage(
        localize('copyFile.copied', sourceFileName, newFileName)
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        localize('copyFile.error') + `: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };
}