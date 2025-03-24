import * as fg from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileItem } from "../fileItem";
import { FileSystemStrategyBase } from "./fileSystemStrategyBase";

export class TreeFileSystemStrategy extends FileSystemStrategyBase {
  /**
   * ツリー表示モード用のファイル取得メソッド
   * ルートディレクトリのファイルとディレクトリを返す
   */
  public async getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[]
  ): Promise<FileItem[]> {
    try {
      const result: FileItem[] = [];

      // 1. ディレクトリを取得
      const directories = await fg.async(["*"], {
        cwd: workspacePath, // 検索の基準ディレクトリ
        absolute: true, // 絶対パスで結果を返す
        onlyDirectories: true, // ディレクトリのみを取得
        deep: 1, // 検索の深さを1に制限（直下のみ）
        dot: false, // ドットディレクトリも含めない
        ignore: excludes, // 除外パターン
      });

      // ディレクトリをFileItemに変換
      for (const dirPath of directories) {
        try {
          const stats = await fs.promises.stat(dirPath);
          const dirName = path.basename(dirPath);

          result.push(
            new FileItem(
              dirName,
              dirPath,
              stats.mtime,
              stats.birthtime,
              vscode.Uri.file(dirPath),
              true // isDirectory = true
            )
          );
        } catch (error) {
          console.error(`Error getting stats for ${dirPath}:`, error);
        }
      }

      // 2. ファイルを取得
      // includesパターンが指定されている場合はそれを使用し、そうでなければすべてのファイルを対象とする
      const patterns = includes.length > 0 ? includes : ["*"];
      const files = await fg.async(patterns, {
        cwd: workspacePath, // 検索の基準ディレクトリ
        absolute: true, // 絶対パスで結果を返す
        onlyFiles: true, // ファイルのみを取得
        deep: 1, // 検索の深さを1に制限（直下のみ）
        dot: false, // ドットファイルも含めない
        ignore: excludes, // 除外パターン
      });

      // ファイルをFileItemに変換
      for (const filePath of files) {
        try {
          const stats = await fs.promises.stat(filePath);
          const fileName = path.basename(filePath);

          result.push(
            new FileItem(
              fileName,
              filePath,
              stats.mtime,
              stats.birthtime,
              vscode.Uri.file(filePath),
              false // isDirectory = false
            )
          );
        } catch (error) {
          console.error(`Error getting stats for ${filePath}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error reading directory ${workspacePath}:`, error);
      return [];
    }
  }
}
