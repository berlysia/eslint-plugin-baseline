/**
 * 特殊文字を含むルール名を実装ファイル名に変換する関数
 * 例: "@@iterator" → "symbolIterator"
 */
export function transformRuleName(ruleName: string): string {
  // @@で始まるシンボル名をsymbolXxxの形式に変換
  // 例: @@iterator → symbolIterator (最初の文字を大文字に)
  return ruleName.replace(/@@([a-z][a-z_]*)/g, (_, symbolName) => {
    // 最初の文字を大文字にする
    const capitalizedName = symbolName.charAt(0).toUpperCase() + symbolName.slice(1);
    return `symbol${capitalizedName}`;
  });
}