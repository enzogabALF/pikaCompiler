#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const root = path.resolve(__dirname, '..');
const isWin = process.platform === 'win32';
const script = isWin ? path.join(root, 'scripts', 'commit.ps1') : path.join(root, 'scripts', 'commit.sh');

if (!fs.existsSync(script)) {
  console.error('No se encontró el script de commit en', script);
  process.exit(1);
}

let result;
if (isWin) {
  result = spawnSync('powershell.exe', ['-ExecutionPolicy', 'Bypass', '-File', script], { stdio: 'inherit' });
} else {
  result = spawnSync('sh', [script], { stdio: 'inherit' });
}

process.exit(result.status || 0);
