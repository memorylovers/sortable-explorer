import * as assert from 'assert';
import * as path from 'path';
import { FileSystemHelper } from '../fileExplorer/fileSystemHelper';

suite('FileSystemHelper Tests', () => {
    let fileSystemHelper: FileSystemHelper;

    setup(() => {
        fileSystemHelper = new FileSystemHelper();
    });

    suite('shouldExclude Tests', () => {
        // プライベートメソッドをテストするためのヘルパー関数
        function testShouldExclude(filePath: string, excludePatterns: string[]): boolean {
            return (fileSystemHelper as any).shouldExclude(filePath, excludePatterns);
        }

        test('空の除外パターン配列の場合、常にfalseを返す', () => {
            const result = testShouldExclude('/path/to/file.txt', []);
            assert.strictEqual(result, false);
        });

        test('通常のパターンマッチング - パターンが含まれる場合', () => {
            const result = testShouldExclude('/path/to/node_modules/file.txt', ['node_modules']);
            assert.strictEqual(result, true);
        });

        test('通常のパターンマッチング - パターンが含まれない場合', () => {
            const result = testShouldExclude('/path/to/src/file.txt', ['node_modules']);
            assert.strictEqual(result, false);
        });

        test('ワイルドカードパターン - 先頭のワイルドカード', () => {
            const result = testShouldExclude('/path/to/file.txt', ['*.txt']);
            assert.strictEqual(result, true);
        });

        test('ワイルドカードパターン - 末尾のワイルドカード', () => {
            const result = testShouldExclude('/path/to/src/component.js', ['src/*']);
            assert.strictEqual(result, true);
        });

        test('ワイルドカードパターン - 中間のワイルドカード', () => {
            const result = testShouldExclude('/path/to/test.spec.js', ['*.spec.*']);
            assert.strictEqual(result, true);
        });

        test('ワイルドカードパターン - 一致しない場合', () => {
            const result = testShouldExclude('/path/to/file.txt', ['*.js']);
            assert.strictEqual(result, false);
        });

        test('複数のパターン - いずれかに一致する場合', () => {
            const result = testShouldExclude('/path/to/file.txt', ['node_modules', '*.txt']);
            assert.strictEqual(result, true);
        });

        test('複数のパターン - どれにも一致しない場合', () => {
            const result = testShouldExclude('/path/to/file.txt', ['node_modules', '*.js']);
            assert.strictEqual(result, false);
        });

        test('Windowsスタイルのパスが正規化される', () => {
            const result = testShouldExclude('C:\\path\\to\\file.txt', ['*/file.txt']);
            assert.strictEqual(result, true);
        });

        test('ドットを含むパターンが正しくエスケープされる', () => {
            const result = testShouldExclude('/path/to/file.txt', ['*.txt']);
            assert.strictEqual(result, true);
        });
    });

    suite('shouldInclude Tests', () => {
        // プライベートメソッドをテストするためのヘルパー関数
        function testShouldInclude(filePath: string, includePatterns: string[]): boolean {
            return (fileSystemHelper as any).shouldInclude(filePath, includePatterns);
        }

        test('空のincludePatterns配列の場合、常にtrueを返す', () => {
            const result = testShouldInclude('/path/to/file.txt', []);
            assert.strictEqual(result, true);
        });

        test('通常のパターンマッチング - パターンが含まれる場合', () => {
            const result = testShouldInclude('/path/to/src/file.txt', ['src']);
            assert.strictEqual(result, true);
        });

        test('通常のパターンマッチング - パターンが含まれない場合', () => {
            const result = testShouldInclude('/path/to/src/file.txt', ['docs']);
            assert.strictEqual(result, false);
        });

        test('ワイルドカードパターン - 先頭のワイルドカード', () => {
            const result = testShouldInclude('/path/to/file.txt', ['*.txt']);
            assert.strictEqual(result, true);
        });

        test('ワイルドカードパターン - 末尾のワイルドカード', () => {
            const result = testShouldInclude('/path/to/src/component.js', ['src/*']);
            assert.strictEqual(result, true);
        });

        test('ワイルドカードパターン - 中間のワイルドカード', () => {
            const result = testShouldInclude('/path/to/test.spec.js', ['*.spec.*']);
            assert.strictEqual(result, true);
        });

        test('ワイルドカードパターン - 一致しない場合', () => {
            const result = testShouldInclude('/path/to/file.txt', ['*.js']);
            assert.strictEqual(result, false);
        });

        test('複数のパターン - いずれかに一致する場合', () => {
            const result = testShouldInclude('/path/to/file.txt', ['docs', '*.txt']);
            assert.strictEqual(result, true);
        });

        test('複数のパターン - どれにも一致しない場合', () => {
            const result = testShouldInclude('/path/to/file.txt', ['docs', '*.js']);
            assert.strictEqual(result, false);
        });

        test('Windowsスタイルのパスが正規化される', () => {
            const result = testShouldInclude('C:\\path\\to\\file.txt', ['*/file.txt']);
            assert.strictEqual(result, true);
        });

        test('ドットを含むパターンが正しくエスケープされる', () => {
            const result = testShouldInclude('/path/to/file.txt', ['*.txt']);
            assert.strictEqual(result, true);
        });
    });

    suite('shouldDisplay Tests', () => {
        // プライベートメソッドをテストするためのヘルパー関数
        function testShouldDisplay(filePath: string, includePatterns: string[], excludePatterns: string[]): boolean {
            return (fileSystemHelper as any).shouldDisplay(filePath, includePatterns, excludePatterns);
        }

        test('includeとexcludeが両方とも空の場合、trueを返す', () => {
            const result = testShouldDisplay('/path/to/file.txt', [], []);
            assert.strictEqual(result, true);
        });

        test('includeが空でexcludeに一致する場合、falseを返す', () => {
            const result = testShouldDisplay('/path/to/node_modules/file.txt', [], ['node_modules']);
            assert.strictEqual(result, false);
        });

        test('includeが空でexcludeに一致しない場合、trueを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.txt', [], ['node_modules']);
            assert.strictEqual(result, true);
        });

        test('includeに一致しexcludeが空の場合、trueを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.txt', ['src'], []);
            assert.strictEqual(result, true);
        });

        test('includeに一致せずexcludeが空の場合、falseを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.txt', ['docs'], []);
            assert.strictEqual(result, false);
        });

        test('includeとexcludeの両方に一致する場合、falseを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.txt', ['src'], ['*.txt']);
            assert.strictEqual(result, false);
        });

        test('includeに一致しexcludeに一致しない場合、trueを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.js', ['src'], ['*.txt']);
            assert.strictEqual(result, true);
        });

        test('複数のincludeパターンのいずれかに一致し、excludeに一致しない場合、trueを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.js', ['docs', 'src'], ['*.txt']);
            assert.strictEqual(result, true);
        });

        test('複数のexcludeパターンのいずれかに一致する場合、falseを返す', () => {
            const result = testShouldDisplay('/path/to/src/file.txt', ['src'], ['node_modules', '*.txt']);
            assert.strictEqual(result, false);
        });

        test('Windowsスタイルのパスが正規化される', () => {
            const result = testShouldDisplay('C:\\path\\to\\src\\file.js', ['src/*'], ['*.txt']);
            assert.strictEqual(result, true);
        });
    });
});