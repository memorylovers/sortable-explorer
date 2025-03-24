import * as vscode from "vscode";
import { ConfigurationManager } from "../configuration/configurationManager";
import { SortBy, SortByType } from "../configuration/configurationConstants";
import { FileExplorerProvider } from "../fileExplorer/fileExplorerProvider";
import { localize } from "../localization/localization";

/**
 * ソート方法を選択するコマンド
 *
 * @param fileExplorerProvider FileExplorerProviderのインスタンス
 * @returns コマンド実行関数
 */
export function selectSortByCommand(fileExplorerProvider: FileExplorerProvider) {
  return async () => {
    // 現在のソート方法を取得
    const currentSortBy = ConfigurationManager.getSortBy();
    
    // QuickPickの選択肢を作成
    const items: vscode.QuickPickItem[] = [
      {
        label: localize('sortBy.name'),
        description: localize('sortBy.description.name'),
        picked: currentSortBy === SortBy.NAME
      },
      {
        label: localize('sortBy.created'),
        description: localize('sortBy.description.created'),
        picked: currentSortBy === SortBy.DATE_CREATED
      },
      {
        label: localize('sortBy.modified'),
        description: localize('sortBy.description.modified'),
        picked: currentSortBy === SortBy.DATE_MODIFIED
      }
    ];
    
    // QuickPickを表示
    const selected = await vscode.window.showQuickPick(items, {
      placeHolder: localize('sortBy.placeholder'),
      canPickMany: false
    });
    
    // 選択がキャンセルされた場合は何もしない
    if (!selected) {
      return;
    }
    
    // 選択されたソート方法を決定
    let newSortBy: SortByType;
    let sortByName: string;
    
    if (selected.label === localize('sortBy.name')) {
      newSortBy = SortBy.NAME;
      sortByName = localize('sortBy.name');
    } else if (selected.label === localize('sortBy.created')) {
      newSortBy = SortBy.DATE_CREATED;
      sortByName = localize('sortBy.created');
    } else if (selected.label === localize('sortBy.modified')) {
      newSortBy = SortBy.DATE_MODIFIED;
      sortByName = localize('sortBy.modified');
    } else {
      return; // 変更なし
    }
    
    // 現在と同じソート方法が選択された場合は何もしない
    if (newSortBy === currentSortBy) {
      return;
    }
    
    // 設定を更新
    await ConfigurationManager.setSortBy(newSortBy);
    
    // 表示を更新
    fileExplorerProvider.refresh();
    
    // 通知を表示
    vscode.window.showInformationMessage(localize('sortBy.changed', sortByName));
  };
}