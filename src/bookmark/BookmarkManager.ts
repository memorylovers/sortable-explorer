import * as vscode from 'vscode';

const BOOKMARK_STORAGE_KEY = 'sortableExplorer.bookmarks';

export class BookmarkManager {
    private bookmarks: Set<string> = new Set();
    private readonly _onDidChangeBookmarks = new vscode.EventEmitter<void>();
    public readonly onDidChangeBookmarks: vscode.Event<void> = this._onDidChangeBookmarks.event;

    constructor(private workspaceState: vscode.Memento) {}

    /**
     * Initializes the BookmarkManager by loading bookmarks from workspace state.
     */
    public initialize(): void {
        this.loadBookmarks();
    }

    /**
     * Retrieves all bookmarked URIs.
     * @returns An array of bookmarked URIs.
     */
    public getBookmarks(): vscode.Uri[] {
        return Array.from(this.bookmarks).map(uriString => vscode.Uri.parse(uriString));
    }

    /**
     * Adds a URI to the bookmarks.
     * @param uri The URI to bookmark.
     * @returns A promise that resolves when the bookmark is added and saved.
     */
    public async addBookmark(uri: vscode.Uri): Promise<void> {
        const uriString = uri.toString();
        if (!this.bookmarks.has(uriString)) {
            this.bookmarks.add(uriString);
            await this.saveBookmarks();
            this._onDidChangeBookmarks.fire();
        }
    }

    /**
     * Removes a URI from the bookmarks.
     * @param uri The URI to remove from bookmarks.
     * @returns A promise that resolves when the bookmark is removed and saved.
     */
    public async removeBookmark(uri: vscode.Uri): Promise<void> {
        const uriString = uri.toString();
        if (this.bookmarks.has(uriString)) {
            this.bookmarks.delete(uriString);
            await this.saveBookmarks();
            this._onDidChangeBookmarks.fire();
        }
    }

    /**
     * Checks if a URI is bookmarked.
     * @param uri The URI to check.
     * @returns True if the URI is bookmarked, false otherwise.
     */
    public isBookmarked(uri: vscode.Uri): boolean {
        return this.bookmarks.has(uri.toString());
    }

    /**
     * Saves the current bookmarks to workspace state.
     */
    private async saveBookmarks(): Promise<void> {
        await this.workspaceState.update(BOOKMARK_STORAGE_KEY, Array.from(this.bookmarks));
    }

    /**
     * Loads bookmarks from workspace state.
     */
    private loadBookmarks(): void {
        const storedBookmarks = this.workspaceState.get<string[]>(BOOKMARK_STORAGE_KEY, []);
        this.bookmarks = new Set(storedBookmarks);
    }
}