import { readDB, writeDB } from '../services/dbService.js';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
const NOTES_DB = process.env.NOTES_DB;

export async function addNote(username, title, content) {
    const notes = await readDB(NOTES_DB);
    notes.push({
        id: uuidv4(),
        username,
        title,
        content,
        createdAt: new Date().toISOString(),
        important: false
    });
    await writeDB(NOTES_DB, notes);
}

export async function deleteNote(noteId, username) {
    const notes = await readDB(NOTES_DB);
    const noteIndex = notes.findIndex(n => n.id === noteId && n.username === username);
    if (noteIndex === -1) throw new Error('Poznámka nenalezena');

    notes.splice(noteIndex, 1);
    await writeDB(NOTES_DB, notes);
}

export async function toggleImportant(noteId, username) {
    const notes = await readDB(NOTES_DB);
    const note = notes.find(n => n.id === noteId && n.username === username);
    if (!note) throw new Error('Poznámka nenalezena');

    note.important = !note.important;
    await writeDB(NOTES_DB, notes);
}

export async function getUserNotes(username, onlyImportant = false) {
    const notes = await readDB(NOTES_DB);
    let userNotes = notes.filter(n => n.username === username);

    if (onlyImportant) {
        userNotes = userNotes.filter(n => n.important);
    }

    return userNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

export async function deleteUserNotes(username) {
    const notes = await readDB(NOTES_DB);
    const filtered = notes.filter(n => n.username !== username);
    await writeDB(NOTES_DB, filtered);
}
