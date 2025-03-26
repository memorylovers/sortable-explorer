import * as vscode from "vscode";
import { FileItem } from "./fileItem";
import { FileSystemHelper } from "./fileSystemHelper";
import { SortingStrategyFactory } from "./sortingStrategy";
import { ConfigurationManager } from "../configuration/configurationManager";
import { SortDirection, EXTENSION_NAME, ViewMode } from "../configuration/configurationConstants";
import { BookmarkInfo } from "../commands/toggleBookmarkCommand";

export class FileExplorerProvider implements vscode.TreeDataProvider<FileItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    FileItem | undefined | null | void
  > = new vscode.EventEmitter<FileItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<
    FileItem | undefined | null | void
  > = this._onDidChangeTreeData.event;

  private fileSystemHelper: FileSystemHelper;

  constructor(private readonly context: vscode.ExtensionContext) {
    this.fileSystemHelper = new FileSystemHelper();

    // 設定変更を監視
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(EXTENSION_NAME)) {
        this.refresh();
      }
    });

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
    // 表示モードを取得
    const viewMode = ConfigurationManager.getViewMode();
    
    // ブックマークモードの場合
    if (viewMode === ViewMode.BOOKMARKS && !element) {
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
    
    // ツリー表示モードで、要素が指定されている場合（ディレクトリの展開）
    if (viewMode === ViewMode.TREE && element && element.isDirectory) {
      return this.fileSystemHelper.getChildren(
        element.filePath,
        ConfigurationManager.getIncludePatterns(),
        ConfigurationManager.getExcludePatterns()
      ).then(children => {
        // ディレクトリとファイルを分離
        const directories = children.filter(item => item.isDirectory);
        const files = children.filter(item => !item.isDirectory);
        
        // 設定に基づいてファイルのみを並び替え
        const sortBy = ConfigurationManager.getSortBy();
        const ascending = ConfigurationManager.getSortDirection() === SortDirection.ASC;
        const sortingStrategy = SortingStrategyFactory.createStrategy(
          sortBy,
          ascending
        );
        
        const sortedFiles = sortingStrategy.sort(files);
        
        // ディレクトリを先に表示し、その後にソートされたファイルを表示
        return [...directories, ...sortedFiles];
      });
    }
    
    // ルート要素の場合
    if (!element) {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        return [];
      }

      // すべてのワークスペースフォルダからファイルを取得
      let allFiles: FileItem[] = [];
      for (const folder of workspaceFolders) {
        console.log(`Reading workspace from ${folder.uri.fsPath}`);

        // includeとexcludeの両方を使用する
        const files = await this.fileSystemHelper.getFiles(
          folder.uri.fsPath,
          ConfigurationManager.getIncludePatterns(),
          ConfigurationManager.getExcludePatterns()
        );
        allFiles = allFiles.concat(files);
      }

      // 表示モードに応じて並び替え方法を変更
      const viewMode = ConfigurationManager.getViewMode();
      const sortBy = ConfigurationManager.getSortBy();
      const ascending = ConfigurationManager.getSortDirection() === SortDirection.ASC;
      const sortingStrategy = SortingStrategyFactory.createStrategy(
        sortBy,
        ascending
      );

      if (viewMode === ViewMode.FLAT) {
        // フラットモードでは全てのアイテムを並び替え
        return sortingStrategy.sort(allFiles);
      } else {
        // ツリーモードではディレクトリとファイルを分離して、ファイルのみ並び替え
        const directories = allFiles.filter(item => item.isDirectory);
        const files = allFiles.filter(item => !item.isDirectory);
        
        const sortedFiles = sortingStrategy.sort(files);
        
        // ディレクトリを先に表示し、その後にソートされたファイルを表示
        return [...directories, ...sortedFiles];
      }
    }
    
    // その他の場合（通常はここには来ない）
    return [];
  }
}
