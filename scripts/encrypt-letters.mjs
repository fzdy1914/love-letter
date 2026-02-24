import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAW_DIR = path.resolve(__dirname, '..', 'raw-letters');
const OUT_DIR = path.resolve(__dirname, '..', 'public', 'letters');

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100_000;

function encryptText(plaintext, password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, 32, 'sha256');
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, encrypted, authTag]).toString('base64');
}

// Ensure output directory exists
fs.mkdirSync(OUT_DIR, { recursive: true });

// Read all .txt files from raw-letters/
const files = fs.readdirSync(RAW_DIR).filter((f) => f.endsWith('.txt'));

if (files.length === 0) {
  console.log('No .txt files found in raw-letters/');
  process.exit(0);
}

console.log(`Found ${files.length} letter(s) to encrypt:\n`);

for (const file of files) {
  const filePath = path.join(RAW_DIR, file);
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  if (lines.length < 2) {
    console.log(`  ✗ ${file} — skipped (need at least 2 lines: password + content)`);
    continue;
  }

  const password = lines[0].trim();
  const letterText = lines.slice(1).join('\n').trim();
  const letterId = path.basename(file, '.txt');

  if (!password) {
    console.log(`  ✗ ${file} — skipped (first line is empty, should be password)`);
    continue;
  }

  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    console.log(`  ✗ ${file} — skipped (password "${password}" must be alphanumeric only)`);
    continue;
  }

  if (!letterText) {
    console.log(`  ✗ ${file} — skipped (no letter content after password line)`);
    continue;
  }

  const encrypted = encryptText(letterText, password);
  const outPath = path.join(OUT_DIR, `${letterId}.txt`);
  fs.writeFileSync(outPath, encrypted);

  console.log(`  ✓ ${file} → public/letters/${letterId}.txt (password: ${password})`);
}

console.log('\nDone! Run "npm run build" to rebuild the site.');
