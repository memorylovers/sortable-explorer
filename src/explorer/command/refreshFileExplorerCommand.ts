import { SortableExplorerProvider } from "../SortableExplorerProvider";

// ファイルエクスプローラー更新コマンド
export function refreshFileExplorerCommand(
  fileExplorerProvider: SortableExplorerProvider
) {
  return () => {
    fileExplorerProvider.refresh();
  };
}
