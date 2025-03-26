import * as vscode from "vscode";
import { FileItem } from "./fileItem";
import { FileSystemHelper } from "./fileSystemHelper";
import { SortingStrategyFactory } from "./sortingStrategy";
import { ConfigurationManager } from "../configuration/configurationManager";
import { SortDirection } from "../configuration/configurationConstants";
import { BookmarkInfo } from "../commands/toggleBookmarkCommand";

export class BookmarkExplorerProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private fileSystemHelper: FileSystemHelper;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.fileSystemHelper = new FileSystemHelper();

    // ファイルシステムの変更を監視
    const fileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*");
    fileSystemWatcher.onDidCreate(() => this.refresh());
    fileSystemWatcher.onDidChange(() => this.refresh());
    fileSystemWatcher.onDidDelete(() => this.refresh());
  }

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: FileItem): vscode.TreeItem {
    return element;
  }

  async getChildren(element?: FileItem): Promise<FileItem[]> {
    // ブックマークビューでは常にブックマークされたファイルのみを表示
    if (!element) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return [];
      }
      
      // ブックマーク一覧を取得
      const bookmarks: BookmarkInfo[] = this.context.workspaceState.get("sortable-explorer.bookmarks", []);
      
      // タイムスタンプの降順でソート（最近追加したものが先頭に来るように）
      bookmarks.sort((a, b) => b.timestamp - a.timestamp);
      
      // ブックマークされたファイルのパスのリスト
      const bookmarkedPaths = bookmarks.map(bookmark => bookmark.filePath);
      
      // ブックマークされたファイルのみを取得
      let bookmarkedFiles: FileItem[] = [];
      for (const folder of workspaceFolders) {
        const files = await this.fileSystemHelper.getFiles(
          folder.uri.fsPath,
          ConfigurationManager.getIncludePatterns(),
          ConfigurationManager.getExcludePatterns()
        );
        
        // ブックマークされたファイルのみをフィルタリング
        const filteredFiles = files.filter(file => 
          !file.isDirectory && bookmarkedPaths.includes(file.filePath)
        ).map(file => new FileItem(
          file.name,
          file.filePath,
          file.modifiedTime,
          file.createdTime,
          file.resourceUri,
          file.isDirectory,
          file.parent,
          true // isBookmarked = true
        ));
        
        bookmarkedFiles = bookmarkedFiles.concat(filteredFiles);
      }
      
      // ブックマークの追加順（タイムスタンプの降順）でソート
      return bookmarkedFiles.sort((a, b) => {
        const aIndex = bookmarkedPaths.indexOf(a.filePath);
        const bIndex = bookmarkedPaths.indexOf(b.filePath);
        return aIndex - bIndex;
      });
    }
    
    // ブックマークビューではディレクトリの展開は行わない
    return [];
  }
}