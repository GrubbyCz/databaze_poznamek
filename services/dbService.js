import fs from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import { hashPassword, comparePassword } from './hashService.js';

dotenv.config();

const USERS_DB = process.env.USERS_DB;
const NOTES_DB = process.env.NOTES_DB;

// Načti JSON ze souboru
async function readJson(path) {
    const data = await fs.readFile(path, 'utf-8');
    return JSON.parse(data);
}

// Zapiš JSON do souboru
async function writeJson(path, data) {
    await fs.writeFile(path, JSON.stringify(data, null, 2), 'utf-8');
}

// -------------------
// Uživatelské funkce
// -------------------

export async function registerUser(username, password) {
    const users = await readJson(USERS_DB);
    if (users.find(user => user.username === username)) {
        throw new Error('Uživatel již existuje.');
    }

    const hashed = await hashPassword(password);
    users.push({ username, password: hashed });
    await writeJson(USERS_DB, users);
}

export async function loginUser(username, password) {
    const users = await readJson(USERS_DB);
    const user = users.find(user => user.username === username);
    if (!user) return false;

    return await comparePassword(password, user.password);
}

export async function deleteAccount(username, password) {
    const users = await readJson(USERS_DB);
    const user = users.find(u => u.username === username);
    if (!user) return false;

    const match = await comparePassword(password, user.password);
    if (!match) return false;

    const newUsers = users.filter(u => u.username !== username);
    await writeJson(USERS_DB, newUsers);

    // smažeme i poznámky daného uživatele
    const notes = await readJson(NOTES_DB);
    const newNotes = notes.filter(note => note.username !== username);
    await writeJson(NOTES_DB, newNotes);

    return true;
}

// ------------------
// Poznámkové funkce
// ------------------

export async function addNote(username, title, text) {
    const notes = await readJson(NOTES_DB);
    const newNote = {
        id: uuidv4(),
        username,
        title,
        text,
        date: new Date().toISOString(),
        important: false
    };
    notes.push(newNote);
    await writeJson(NOTES_DB, notes);
}

export async function getNotes(username) {
    const notes = await readJson(NOTES_DB);
    return notes
        .filter(note => note.username === username)
        .sort((a, b) => new Date(b.date) - new Date(a.date));
}

export async function deleteNote(id) {
    const notes = await readJson(NOTES_DB);
    const filtered = notes.filter(note => note.id !== id);
    await writeJson(NOTES_DB, filtered);
}

export async function markImportant(id) {
    const notes = await readJson(NOTES_DB);
    const note = notes.find(n => n.id === id);
    if (note) note.important = !note.important;
    await writeJson(NOTES_DB, notes);
}