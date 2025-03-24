import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { FileSystemStrategyBase } from '../fileExplorer/strategies/fileSystemStrategyBase';

// テスト用のFileSystemStrategyBaseの実装クラス
class TestFileSystemStrategy extends FileSystemStrategyBase {
  // 抽象メソッドの実装（テストでは使用しないがインターフェースを満たすために必要）
  public async getFiles(
    workspacePath: string,
    includes: string[],
    excludes: string[]
  ): Promise<any[]> {
    return [];
  }
}

suite('FileSystemStrategyBase Tests', () => {
  let strategy: TestFileSystemStrategy;
  let tempDir: string;

  // 各テスト前の準備
  setup(async () => {
    strategy = new TestFileSystemStrategy();
    // テスト用の一時ディレクトリを作成
    tempDir = path.join(os.tmpdir(), `test-${Date.now()}`);
    await fs.promises.mkdir(tempDir, { recursive: true });
  });

  // 各テスト後のクリーンアップ
  teardown(async () => {
    // テスト用の一時ディレクトリを削除
    await fs.promises.rm(tempDir, { recursive: true, force: true });
  });

  test('新しいノートファイルが正常に作成される', async () => {
    const title = 'TestNote';
    const filePath = await strategy.createNewNote(tempDir, title);
    
    // ファイルが存在することを確認
    const exists = await fileExists(filePath);
    assert.strictEqual(exists, true, 'ファイルが作成されていません');
    
    // ファイルの内容を確認
    const content = await fs.promises.readFile(filePath, 'utf8');
    assert.strictEqual(content, `# ${title}`, 'ファイルの内容が正しくありません');
    
    // ファイル名のフォーマットを確認
    const fileName = path.basename(filePath);
    const datePattern = /^\d{8}_TestNote\.md$/;
    assert.strictEqual(datePattern.test(fileName), true, 'ファイル名のフォーマットが正しくありません');
  });

  test('同名のファイルが存在する場合、連番が付いたファイルが作成される', async () => {
    const title = 'DuplicateNote';
    
    // 1つ目のファイルを作成
    const filePath1 = await strategy.createNewNote(tempDir, title);
    assert.strictEqual(await fileExists(filePath1), true, '1つ目のファイルが作成されていません');
    
    // 2つ目のファイル（同じタイトル）を作成
    const filePath2 = await strategy.createNewNote(tempDir, title);
    assert.strictEqual(await fileExists(filePath2), true, '2つ目のファイルが作成されていません');
    
    // 2つのファイルが異なることを確認
    assert.notStrictEqual(filePath1, filePath2, '同名のファイルが上書きされています');
    
    // 2つ目のファイル名に連番が付いていることを確認
    const fileName2 = path.basename(filePath2);
    const datePattern = /^\d{8}_DuplicateNote_1\.md$/;
    assert.strictEqual(datePattern.test(fileName2), true, '2つ目のファイル名に連番が付いていません');
  });

  test('複数の同名ファイルが存在する場合、適切な連番が付いたファイルが作成される', async () => {
    const title = 'MultipleNote';
    
    // 1つ目のファイルを作成
    const filePath1 = await strategy.createNewNote(tempDir, title);
    
    // 2つ目のファイルを作成
    const filePath2 = await strategy.createNewNote(tempDir, title);
    
    // 3つ目のファイルを作成
    const filePath3 = await strategy.createNewNote(tempDir, title);
    
    // すべてのファイルが存在することを確認
    assert.strictEqual(await fileExists(filePath1), true, '1つ目のファイルが作成されていません');
    assert.strictEqual(await fileExists(filePath2), true, '2つ目のファイルが作成されていません');
    assert.strictEqual(await fileExists(filePath3), true, '3つ目のファイルが作成されていません');
    
    // すべてのファイルが異なることを確認
    assert.notStrictEqual(filePath1, filePath2, '1つ目と2つ目のファイルが同じです');
    assert.notStrictEqual(filePath2, filePath3, '2つ目と3つ目のファイルが同じです');
    assert.notStrictEqual(filePath1, filePath3, '1つ目と3つ目のファイルが同じです');
    
    // ファイル名の連番を確認
    const fileName1 = path.basename(filePath1);
    const fileName2 = path.basename(filePath2);
    const fileName3 = path.basename(filePath3);
    
    const basePattern = /^\d{8}_MultipleNote(.*?)\.md$/;
    assert.strictEqual(basePattern.test(fileName1), true, '1つ目のファイル名のフォーマットが正しくありません');
    assert.strictEqual(/^\d{8}_MultipleNote_1\.md$/.test(fileName2), true, '2つ目のファイル名の連番が正しくありません');
    assert.strictEqual(/^\d{8}_MultipleNote_2\.md$/.test(fileName3), true, '3つ目のファイル名の連番が正しくありません');
  });
});

// ファイルが存在するかどうかを確認するヘルパー関数
async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.promises.access(filePath, fs.constants.F_OK);
    return true;
  } catch (error) {
    return false;
  }
}