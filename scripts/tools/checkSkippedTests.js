#!/usr/bin/env node
/**
 * このスクリプトはテストファイル内で「将来対応予定」などとしてコメントアウトされたテストケースを検出します。
 * 本来テストすべき機能が実装されていない状態でコミットされることを防ぐのが目的です。
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 現在のディレクトリを取得
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const testDir = path.join(projectRoot, 'test/rules');

// スキップ検出パターン
const SKIPPED_TEST_PATTERNS = [
  /\/\* *将来対応予定/,               // 日本語コメント: /* 将来対応予定
  /\/\* *future implementation/i,     // 英語コメント: /* Future implementation
  /\/\/ *TODO:/i,                     // TODOコメント: // TODO:
  /validOnlyCodes:.*\/\*/s,           // コメントアウトされたvalidOnlyCodes
  /codes:.*\/\*\s+.*codes/s,          // コメントアウトされたcodes
];

// コメントアウトされたテストコードを検出する正規表現
const COMMENTED_CODE_PATTERNS = [
  /\/\*\s*["'`].*["'`]/,               // /* "テストコード" または /* 'テストコード' など
  /\/\*\s*(const|let|var|function)/,   // /* const ... などのJavaScriptコード
];

async function findTestFiles() {
  const files = await fs.readdir(testDir, { recursive: true });
  return files
    .filter(file => file.endsWith('.test.ts'))
    .map(file => path.join(testDir, file));
}

async function checkFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const fileName = path.basename(filePath);
  const issues = [];

  // スキップパターンのチェック
  for (const pattern of SKIPPED_TEST_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`将来対応予定などのコメントがあります: ${pattern.toString()}`);
    }
  }

  // コメントアウトされたコードのチェック
  for (const pattern of COMMENTED_CODE_PATTERNS) {
    if (pattern.test(content)) {
      issues.push(`コメントアウトされたテストコードがあります: ${pattern.toString()}`);
    }
  }

  // validOnlyCodesが空かチェック
  if (content.includes('validOnlyCodes: []')) {
    issues.push('空のvalidOnlyCodesがあります');
  }

  return {
    file: fileName,
    path: filePath,
    issues,
    hasIssues: issues.length > 0
  };
}

async function main() {
  const testFiles = await findTestFiles();
  let totalIssues = 0;
  let filesWithIssues = 0;

  console.log(`🔍 ${testFiles.length}個のテストファイルをチェックしています...`);
  
  for (const file of testFiles) {
    const result = await checkFile(file);
    
    if (result.hasIssues) {
      filesWithIssues++;
      totalIssues += result.issues.length;
      
      console.log(`\n❌ ${result.file}`);
      result.issues.forEach(issue => {
        console.log(`  - ${issue}`);
      });
    }
  }

  console.log('\n📊 チェック結果:');
  console.log(`  チェックしたファイル: ${testFiles.length}`);
  console.log(`  問題があるファイル: ${filesWithIssues}`);
  console.log(`  検出された問題: ${totalIssues}`);

  if (totalIssues > 0) {
    console.log('\n❗ 警告: スキップされたテストがあります。これらは実装を完了すべき機能です。');
    process.exit(1);
  } else {
    console.log('\n✅ すべてのテストが正常です。スキップされたテストはありません。');
  }
}

main().catch(err => {
  console.error('エラーが発生しました:', err);
  process.exit(1);
});