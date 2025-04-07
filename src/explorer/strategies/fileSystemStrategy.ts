import { FileItem } from "../FileItem";
import { BookmarkManager } from "../../bookmark/BookmarkManager"; // BookmarkManagerをインポート

export interface FileSystemStrategy {
  /**
   * 指定されたディレクトリ内のファイルを取得
   */
  getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプション引数として追加
  ): Promise<FileItem[]>;

  /**
   * 指定されたディレクトリの子要素を取得
   */
  getChildren(
    directoryPath: string,
    includes: string[],
    excludes: string[],
    bookmarkManager?: BookmarkManager // BookmarkManagerをオプション引数として追加
  ): Promise<FileItem[]>;
  
  /**
   * 新しいノートファイルを作成する
   */
  createNewNote(targetDirectory: string, title: string): Promise<string>;
  
  /**
   * 指定されたパスが除外パターンに一致するかチェック
   */
  isExcluded(filePath: string, excludes: string[], basePath: string): boolean;
  
  /**
   * 指定されたパスがincludeパターンに一致するかチェック
   */
  matchesIncludePatterns(relativePath: string, includes: string[]): boolean;
}