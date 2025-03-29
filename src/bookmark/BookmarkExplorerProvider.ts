import * as vscode from 'vscode';
import { FileItem } from '../fileExplorer/fileItem';
import { BookmarkManager } from './BookmarkManager';
import * as fs from 'fs';
import * as path from 'path';

export class BookmarkExplorerProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileItem | undefined | null | void> = new vscode.EventEmitter<FileItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FileItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private bookmarkManager: BookmarkManager) {
        // ブックマークの変更を監視してビューを更新
        this.bookmarkManager.onDidChangeBookmarks(() => {
            this.refresh();
        });
    }

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        // FileItemはgetChildrenで生成される際にブックマーク状態が考慮されている
        return element;
    }

    async getChildren(element?: FileItem): Promise<FileItem[]> {
        // ブックマークビューはフラットリストなので、ルート要素のみを処理
        if (element) {
            return []; // 子要素は持たない
        }

        const bookmarkedUris = this.bookmarkManager.getBookmarks();
        const fileItems: FileItem[] = [];

        for (const uri of bookmarkedUris) {
            try {
                const filePath = uri.fsPath;
                // ファイルが存在するか確認
                if (!fs.existsSync(filePath)) {
                    console.warn(`Bookmarked file not found, removing: ${filePath}`);
                    // 見つからないブックマークは自動的に削除する（オプション）
                    await this.bookmarkManager.removeBookmark(uri);
                    continue; // 次のブックマークへ
                }

                const stats = await fs.promises.stat(filePath);
                const fileName = path.basename(filePath);
                const isDirectory = stats.isDirectory(); // ディレクトリもブックマーク可能とする

                // FileItemを作成 (BookmarkManagerを渡してアイコンとコンテキスト値を正しく設定)
                fileItems.push(
                    new FileItem(
                        fileName,
                        filePath,
                        stats.mtime,
                        stats.birthtime,
                        uri,
                        isDirectory,
                        undefined, // parent
                        this.bookmarkManager // BookmarkManagerを渡す
                    )
                );
            } catch (error) {
                console.error(`Error processing bookmarked file ${uri.fsPath}:`, error);
                 // エラーが発生したブックマークも削除する（オプション）
                 // await this.bookmarkManager.removeBookmark(uri);
            }
        }

        // ここでソートが必要な場合は追加する (例: 名前順)
        fileItems.sort((a, b) => a.name.localeCompare(b.name));

        return fileItems;
    }
}