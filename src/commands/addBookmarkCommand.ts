import * as vscode from 'vscode';
import { BookmarkManager } from '../bookmark/BookmarkManager';
import { FileItem } from '../fileExplorer/fileItem';

export class AddBookmarkCommand {
    constructor(private bookmarkManager: BookmarkManager) {}

    public async execute(item: FileItem | vscode.Uri | undefined): Promise<void> {
        let targetUri: vscode.Uri | undefined;

        if (item instanceof FileItem) {
            targetUri = item.resourceUri;
        } else if (item instanceof vscode.Uri) {
            targetUri = item;
        } else {
            // コマンドパレットから実行された場合など、アクティブなエディタのURIを使用
            targetUri = vscode.window.activeTextEditor?.document.uri;
        }

        if (targetUri) {
            try {
                await this.bookmarkManager.addBookmark(targetUri);
                // 成功メッセージは任意
                // vscode.window.showInformationMessage(`Bookmarked: ${path.basename(targetUri.fsPath)}`);
            } catch (error) {
                console.error('Error adding bookmark:', error);
                vscode.window.showErrorMessage('Failed to add bookmark.');
            }
        } else {
            vscode.window.showWarningMessage('No file selected to bookmark.');
        }
    }
}