import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In a real scenario, this key should be in an environment variable.
// For this implementation, we'll use a placeholder that matches the one in the frontend.
// The user should replace this with a real 32-byte key (64 hex characters).
const ENCRYPTION_KEY_HEX = process.env.ASSET_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
const key = Buffer.from(ENCRYPTION_KEY_HEX, 'hex');

const inputDir = path.join(__dirname, '../public/models');
const outputDir = inputDir;

if (!fs.existsSync(inputDir)) {
    console.error(`Input directory not found: ${inputDir}`);
    process.exit(1);
}

const files = fs.readdirSync(inputDir).filter(f => f.endsWith('.glb'));

files.forEach(file => {
    const inputPath = path.join(inputDir, file);
    const outputPath = path.join(outputDir, `${file}.enc`);

    const data = fs.readFileSync(inputPath);
    const iv = crypto.randomBytes(12); // GCM standard IV size
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

    const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
    const authTag = cipher.getAuthTag();

    // File format: [IV (12 bytes)][Ciphertext][AuthTag (16 bytes)]
    // Web Crypto API expects the tag to be at the end of the ciphertext.
    const finalBuffer = Buffer.concat([iv, encrypted, authTag]);

    fs.writeFileSync(outputPath, finalBuffer);
    console.log(`Encrypted: ${file} -> ${file}.enc`);
});

console.log('Asset encryption complete.');
