import * as vscode from 'vscode';
import { BookmarkManager } from '../bookmark/BookmarkManager';
import { FileItem } from '../fileExplorer/fileItem';

export class RemoveBookmarkCommand {
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
                await this.bookmarkManager.removeBookmark(targetUri);
                 // 成功メッセージは任意
                // vscode.window.showInformationMessage(`Removed bookmark: ${path.basename(targetUri.fsPath)}`);
            } catch (error) {
                console.error('Error removing bookmark:', error);
                vscode.window.showErrorMessage('Failed to remove bookmark.');
            }
        } else {
            vscode.window.showWarningMessage('No file selected to remove bookmark from.');
        }
    }
}