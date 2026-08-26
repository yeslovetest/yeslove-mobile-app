#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const targetPath = path.join(root, 'generated-api', 'base.ts');

const replacementLine =
  'export const BASE_PATH = (process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:5000").replace(/\\/+$/, "");';

try {
  const original = fs.readFileSync(targetPath, 'utf8');

  const pattern = /export const BASE_PATH = .*?;\r?\n/;
  if (!pattern.test(original)) {
    console.error('Could not find BASE_PATH line in generated-api/base.ts');
    process.exit(1);
  }

  const updated = original.replace(pattern, `${replacementLine}\n`);

  if (updated !== original) {
    fs.writeFileSync(targetPath, updated, 'utf8');
    console.log('Patched generated-api/base.ts BASE_PATH successfully.');
  } else {
    console.log('generated-api/base.ts BASE_PATH already up to date.');
  }
} catch (error) {
  console.error(`Failed to patch generated-api/base.ts: ${error.message}`);
  process.exit(1);
}
