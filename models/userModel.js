import { readDB, writeDB } from '../services/dbService.js';
import { hashPassword, verifyPassword } from '../services/hashService.js';
import dotenv from 'dotenv';

dotenv.config();
const USERS_DB = process.env.USERS_DB;

export async function registerUser(username, password, consent) {
    const users = await readDB(USERS_DB);
    
    if (users.find(user => user.username === username)) {
        throw new Error('Uživatel již existuje');
    }
    if (!consent) {
        throw new Error('Souhlas je nutný pro registraci.');
    }

    const passwordHash = await hashPassword(password);
    users.push({ username, passwordHash, consent });
    await writeDB(USERS_DB, users);
}

export async function loginUser(username, password) {
    const users = await readDB(USERS_DB);
    const user = users.find(u => u.username === username);
    if (!user) throw new Error('Uživatel nenalezen');

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('Špatné heslo');

    return user;
}

export async function deleteUser(username, password) {
    const users = await readDB(USERS_DB);
    const userIndex = users.findIndex(u => u.username === username);
    if (userIndex === -1) throw new Error('Uživatel nenalezen');

    const valid = await verifyPassword(password, users[userIndex].passwordHash);
    if (!valid) throw new Error('Špatné heslo');

    users.splice(userIndex, 1);
    await writeDB(USERS_DB, users);
}
