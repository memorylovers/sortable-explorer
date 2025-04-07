import * as fg from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import { FileItem } from "../fileItem";
import { FileSystemStrategyBase } from "./fileSystemStrategyBase";
import { BookmarkManager } from "../../bookmark/BookmarkManager"; // BookmarkManagerをインポート

export class TreeFileSystemStrategy extends FileSystemStrategyBase {
  /**
   * ツリー表示モード用のファイル取得メソッド
   * ルートディレクトリのファイルとディレクトリを返す
   */
  public async getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプション引数として追加
  ): Promise<FileItem[]> {
    return this.readDirectory(workspacePath, includes, excludes, bookmarkManager);
  }

  /**
   * 指定されたディレクトリの子要素を取得
   */
  public async getChildren(
    directoryPath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプション引数として追加
  ): Promise<FileItem[]> {
    // getFilesと同じロジックでディレクトリを読む
    return this.readDirectory(directoryPath, includes, excludes, bookmarkManager);
  }

  /**
   * 指定されたディレクトリの内容を読み取り、FileItemのリストを返す共通メソッド
   */
  private async readDirectory(
    directoryPath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager
  ): Promise<FileItem[]> {
    try {
      const result: FileItem[] = [];

      // 1. ディレクトリを取得
      const directories = await fg.async(["*"], {
        cwd: directoryPath, // 検索の基準ディレクトリ
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
              true, // isDirectory = true
              undefined, // parent は undefined (ルートレベルまたはgetChildrenの直接の子)
              bookmarkManager // BookmarkManagerを渡す
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
        cwd: directoryPath, // 検索の基準ディレクトリ
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
              false, // isDirectory = false
              undefined, // parent は undefined (ルートレベルまたはgetChildrenの直接の子)
              bookmarkManager // BookmarkManagerを渡す
            )
          );
        } catch (error) {
          console.error(`Error getting stats for ${filePath}:`, error);
        }
      }

      return result;
    } catch (error) {
      console.error(`Error reading directory ${directoryPath}:`, error);
      return [];
    }
  }
}
