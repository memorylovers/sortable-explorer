import * as path from "path";
import * as vscode from "vscode";
import { COMMANDS } from "../../configuration/configurationConstants";
import { FileItem } from "../FileItem";
import { localize } from "../../localization/localization";

/**
 * ヘルパー関数：ワークスペース内のフォルダを取得
 * NOTE: この関数は適切な場所に移動するか、既存のユーティリティを使用してください。
 * findFilesは非常に多くの結果を返す可能性があるため、適切な除外設定が必要です。
 */
async function getWorkspaceFolders(): Promise<vscode.Uri[]> {
  // files.excludeの設定を取得
  const filesExcludeConfig = vscode.workspace
    .getConfiguration("files")
    .get<{ [key: string]: boolean }>("exclude");
  const excludePattern = filesExcludeConfig
    ? `{${Object.entries(filesExcludeConfig)
        .filter(([, enabled]) => enabled)
        .map(([pattern]) => pattern)
        .join(",")}}`
    : undefined;

  const workspaceFolders = vscode.workspace.workspaceFolders;
  if (!workspaceFolders) {
    return [];
  }

  // findFilesを使ってサブフォルダも検索する場合 (パフォーマンス注意)
  // 検索パターンを '**/' にしてフォルダのみを対象とする試み（VS Code APIのバージョンによる）
  // findFilesの結果にはフォルダも含まれるため、後でフィルタリングする方が確実かもしれない
  // nullの代わりにexcludePatternを使用
  const allUris = await vscode.workspace.findFiles(
    "**/*",
    excludePattern,
    5000
  ); // 上限を設定
  const folderUris = new Set<string>(); // 重複を避けるためSetを使用

  // まずワークスペースルートを追加
  workspaceFolders.forEach((wf) => folderUris.add(wf.uri.toString()));

  // 見つかったURIの親フォルダを追加していく
  for (const uri of allUris) {
    let dirUri = vscode.Uri.joinPath(uri, "..");
    // ワークスペースフォルダ内に含まれるか確認しながら追加
    for (const wf of workspaceFolders) {
      if (dirUri.fsPath.startsWith(wf.uri.fsPath)) {
        // ルートに達するまで親フォルダを追加
        while (
          dirUri.fsPath !== wf.uri.fsPath &&
          dirUri.fsPath.length > wf.uri.fsPath.length
        ) {
          // 既にSetに含まれていれば、それ以上親を辿る必要はないかもしれない
          if (folderUris.has(dirUri.toString())) {
            break;
          }
          folderUris.add(dirUri.toString());
          dirUri = vscode.Uri.joinPath(dirUri, "..");
        }
        // ワークスペースルート自体も追加（ループの条件で抜ける場合があるため）
        if (dirUri.fsPath === wf.uri.fsPath) {
          folderUris.add(dirUri.toString());
        }
        break; // 一致するワークスペースが見つかったら抜ける
      }
    }
  }

  // Set<string> を vscode.Uri[] に変換して返す
  // パス文字列でソート
  return Array.from(folderUris)
    .map((uriString) => vscode.Uri.parse(uriString))
    .sort((a, b) => a.fsPath.localeCompare(b.fsPath));

  // --- シンプルな実装：ワークスペースルートのみを返す場合 ---
  // return workspaceFolders.map(folder => folder.uri);
}

/**
 * ファイルを移動するコマンド
 * @param item 右クリックされたファイルアイテム
 */
export async function moveFileCommand(item?: FileItem): Promise<void> {
  if (!item || !item.resourceUri || item.isDirectory) {
    vscode.window.showErrorMessage(
      localize(
        item?.isDirectory
          ? "moveFile.error.cannotMoveFolder"
          : "moveFile.error.noFileSelected"
      )
    );
    return;
  }

  const sourceUri = item.resourceUri;
  const sourceFileName = path.basename(sourceUri.fsPath);
  const workspaceFolders = vscode.workspace.workspaceFolders; // ここで取得

  // --- showOpenDialog から showQuickPick への変更 ---

  // ワークスペース内のフォルダを取得
  let folders: vscode.Uri[];
  try {
    folders = await getWorkspaceFolders();
  } catch (error: any) {
    vscode.window.showErrorMessage(
      localize("moveFile.error.fetchFoldersFailed", error.message)
    );
    console.error("Error fetching workspace folders:", error);
    return;
  }

  if (!folders || folders.length === 0) {
    vscode.window.showInformationMessage(localize("moveFile.info.noFolders"));
    return;
  }

  // QuickPickアイテムを作成
  const quickPickItems: (vscode.QuickPickItem & { uri: vscode.Uri })[] =
    folders.map((folder) => {
      const relativePath = vscode.workspace.asRelativePath(folder, false);
      // workspaceFoldersが未定義の場合のフォールバックを追加
      const isRoot =
        workspaceFolders?.some(
          (wf) => wf.uri.toString() === folder.toString()
        ) ?? false;
      const label = isRoot
        ? `$(folder-opened) ${path.basename(folder.fsPath)}`
        : `$(folder) ${path.basename(folder.fsPath)}`;
      // ルートフォルダの場合や相対パスが取得できない場合はフルパスを表示
      const description =
        relativePath && relativePath !== path.basename(folder.fsPath)
          ? relativePath
          : folder.fsPath; // 修正：ルートの場合フルパス
      return {
        label: label,
        description: description,
        uri: folder, // カスタムプロパティとしてURIを保持
      };
    });

  // 移動先フォルダを選択
  const selectedItem = await vscode.window.showQuickPick<
    vscode.QuickPickItem & { uri: vscode.Uri }
  >(quickPickItems, {
    placeHolder: localize("moveFile.selectDestinationFolder.placeholder"), // 新しいローカライズキー
    canPickMany: false,
    matchOnDescription: true, // 説明（パス）でも検索可能にする
    ignoreFocusOut: true, // QuickPickがフォーカスを失っても閉じないようにする
  });

  if (!selectedItem) {
    return; // キャンセルされた場合
  }

  const destinationFolderUri = selectedItem.uri; // 選択されたアイテムからURIを取得
  // --- 変更ここまで ---

  const destinationUri = vscode.Uri.joinPath(
    destinationFolderUri,
    sourceFileName
  );

  // 移動元と移動先が同じ場合は何もしない
  // 移動元ファイルが移動先フォルダに直接含まれる場合も含む
  if (
    sourceUri.fsPath === destinationUri.fsPath ||
    path.dirname(sourceUri.fsPath) === destinationFolderUri.fsPath
  ) {
    vscode.window.showInformationMessage(
      localize("moveFile.info.sourceEqualsDestination")
    );
    return;
  }

  try {
    // 移動先に同名ファイルが存在するか確認
    try {
      await vscode.workspace.fs.stat(destinationUri);
      // ファイルが存在する場合、上書き確認
      const destinationDesc =
        vscode.workspace.asRelativePath(destinationFolderUri, false) ||
        destinationFolderUri.fsPath;
      const overwriteConfirmation = await vscode.window.showWarningMessage(
        localize("moveFile.confirmOverwrite", sourceFileName, destinationDesc), // 上書きメッセージに情報を追加
        { modal: true },
        localize("common.yes"),
        localize("common.no")
      );

      if (overwriteConfirmation !== localize("common.yes")) {
        return; // 上書きしない場合はキャンセル
      }
    } catch (error: any) {
      // stat でファイルが存在しない場合はエラーになるので、ここでは無視して続行
      // vscode.FileSystemError.FileNotFound を使う方が型安全
      if (
        error instanceof vscode.FileSystemError &&
        (error.code === "FileNotFound" || error.code === "ENOENT")
      ) {
        // ENOENTも追加
        // OK、ファイルは存在しない
      } else {
        throw error; // その他のエラーは再スロー
      }
    }

    // ファイルを移動 (rename を使用)
    await vscode.workspace.fs.rename(sourceUri, destinationUri, {
      overwrite: true,
    }); // 上書き確認済みなので overwrite: true

    // エクスプローラーを更新
    await vscode.commands.executeCommand(COMMANDS.REFRESH_FILE_EXPLORER);

    const destinationDesc =
      vscode.workspace.asRelativePath(destinationFolderUri, false) ||
      destinationFolderUri.fsPath;
    vscode.window.showInformationMessage(
      localize("moveFile.success", sourceFileName, destinationDesc)
    );
  } catch (error: any) {
    const destinationDesc =
      vscode.workspace.asRelativePath(destinationFolderUri, false) ||
      destinationFolderUri.fsPath;
    vscode.window.showErrorMessage(
      localize(
        "moveFile.error.moveFailed",
        sourceFileName,
        destinationDesc,
        error.message
      ) // エラーメッセージにファイル名と移動先を追加
    );
    console.error(
      `Error moving file '${sourceFileName}' to '${destinationDesc}':`,
      error
    );
  }
}
