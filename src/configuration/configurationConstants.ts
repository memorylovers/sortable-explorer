// 拡張機能の基本情報
export const EXTENSION_NAME = "sortable-explorer";

// ビューとビューコンテナのID
export const VIEW_CONTAINER_ID = EXTENSION_NAME;
export const FILE_EXPLORER_VIEW_ID = `${EXTENSION_NAME}.fileExplorer`; // 定数名を変更
export const BOOKMARK_EXPLORER_VIEW_ID = `${EXTENSION_NAME}.bookmarks`; // ブックマークビューIDを追加

// コマンドID
export const COMMANDS = {
  REFRESH_FILE_EXPLORER: `${EXTENSION_NAME}.refreshFileExplorer`,
  CREATE_NEW_NOTE: `${EXTENSION_NAME}.createNewNote`,
  TOGGLE_VIEW_MODE: `${EXTENSION_NAME}.toggleViewMode`,
  TOGGLE_SORT_DIRECTION: `${EXTENSION_NAME}.toggleSortDirection`,
  OPEN_SETTINGS: `${EXTENSION_NAME}.openSettings`,
  DELETE_FILE: `${EXTENSION_NAME}.deleteFile`,
  COPY_FILE: `${EXTENSION_NAME}.copyFile`,
  SELECT_SORT_BY: `${EXTENSION_NAME}.selectSortBy`,
  ADD_TO_EXCLUDE_PATTERNS: `${EXTENSION_NAME}.addToExcludePatterns`,
  RENAME_FILE: `${EXTENSION_NAME}.renameFile`,
  MOVE_FILE: `${EXTENSION_NAME}.moveFile`,
  ADD_BOOKMARK: `${EXTENSION_NAME}.addBookmark`, // ブックマーク追加コマンドID
  REMOVE_BOOKMARK: `${EXTENSION_NAME}.removeBookmark`, // ブックマーク削除コマンドID
} as const;

// 設定のプロパティ名（プレフィックスなし）
export const CONFIG_KEYS = {
  SORT_BY: "sortBy",
  SORT_DIRECTION: "sortDirection",
  INCLUDE_PATTERNS: "includePatterns",
  EXCLUDE_PATTERNS: "excludePatterns",
  VIEW_MODE: "viewMode",
} as const;

// 表示モード
export const ViewMode = {
  FLAT: "flat",
  TREE: "tree",
} as const;

export type ViewModeType = (typeof ViewMode)[keyof typeof ViewMode];

// ソート方法
export const SortBy = {
  NAME: "name",
  DATE_CREATED: "created",
  DATE_MODIFIED: "modified",
} as const;

export type SortByType = (typeof SortBy)[keyof typeof SortBy];

export const SortDirection = {
  ASC: "asc",
  DESC: "desc",
} as const;

export type SortDirectionType =
  (typeof SortDirection)[keyof typeof SortDirection];

export const DefaultPatterns = {
  EXCLUDE: ["**/node_modules"],
  INCLUDE: ["**/*.md", "**/*.txt"],
} as const;

// コンテキストキー
export const CONTEXT_KEYS = {} as const;
