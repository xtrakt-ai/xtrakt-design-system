#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, resolve, sep } from 'node:path';

const defaultRoots = ['packages'];
const roots = process.argv.slice(2).length > 0 ? process.argv.slice(2) : defaultRoots;
const allowedExtensions = new Set(['.css', '.scss', '.sass', '.vue', '.ts', '.tsx', '.html']);
const blocked = [
  '--brand-primary',
  '--brand-primary-deep',
  '--brand-primary-soft',
  '--xt-primary',
  '--neu-accent',
  '--accent',
];
const ignoredPathSuffixes = [
  join('packages', 'design-tokens', 'src', 'tokens.css'),
  join('packages', 'design-tokens', 'stylelint-config-no-legacy-tokens.json'),
];

const findings = [];

for (const root of roots) {
  walk(resolve(root));
}

if (findings.length > 0) {
  console.error('Legacy design token aliases are compatibility-only. Use canonical semantic tokens instead.');
  for (const finding of findings) {
    console.error(`${finding.file}:${finding.line}: ${finding.token}`);
  }
  process.exit(1);
}

function walk(path) {
  let stats;
  try {
    stats = statSync(path);
  } catch {
    return;
  }

  if (stats.isDirectory()) {
    if (shouldSkipDirectory(path)) {
      return;
    }

    for (const entry of readdirSync(path)) {
      walk(join(path, entry));
    }

    return;
  }

  if (!stats.isFile() || !allowedExtensions.has(extname(path))) {
    return;
  }

  const normalizedRelative = relative(process.cwd(), path).split(sep).join('/');
  if (ignoredPathSuffixes.some((ignored) => normalizedRelative.endsWith(ignored.split(sep).join('/')))) {
    return;
  }

  const lines = readFileSync(path, 'utf8').split(/\r?\n/);
  lines.forEach((line, index) => {
    for (const token of blocked) {
      if (line.includes(`var(${token}`) || line.includes(`${token}:`)) {
        findings.push({ file: normalizedRelative, line: index + 1, token });
      }
    }
  });
}

function shouldSkipDirectory(path) {
  const name = path.split(sep).at(-1);
  return ['node_modules', 'dist', 'build', '.git', '.angular', '.vite', 'coverage'].includes(name);
}
