import { readFile, writeFile } from 'fs/promises';
import dotenv from 'dotenv';

dotenv.config();

export async function readDB(path) {
    const data = await readFile(path, 'utf-8');
    return JSON.parse(data);
}

export async function writeDB(path, data) {
    await writeFile(path, JSON.stringify(data, null, 2));
}
