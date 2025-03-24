import * as vscode from 'vscode';
import * as enMessages from '../../package.nls.json';
import * as jaMessages from '../../package.nls.ja.json';

// 言語定義
export type SupportedLanguage = 'en' | 'ja';

// メッセージ定義
const messages: Record<SupportedLanguage, Record<string, string>> = {
  'en': enMessages,
  'ja': jaMessages
};

/**
 * 現在のVSCode言語設定に基づいて言語を取得
 * @returns サポートされている言語（'en'または'ja'）
 */
export function getCurrentLanguage(): SupportedLanguage {
  const vscodeLanguage = vscode.env.language.toLowerCase();
  return vscodeLanguage.startsWith('ja') ? 'ja' : 'en';
}

/**
 * 指定されたキーに対応するローカライズされたメッセージを取得
 * @param key メッセージのキー
 * @param params 置換パラメータ
 * @returns ローカライズされたメッセージ
 */
export function localize(key: string, ...params: string[]): string {
  try {
    const language = getCurrentLanguage();
    let message = messages[language][key] || messages['en'][key] || key;
    
    // パラメータの置換
    if (params.length > 0) {
      params.forEach((param, index) => {
        message = message.replace(`{${index}}`, param);
      });
    }
    
    return message;
  } catch (error) {
    console.error(`Localization error for key "${key}":`, error);
    return key;
  }
}