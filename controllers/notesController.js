import { addNote, deleteNote, toggleImportant, getUserNotes } from '../models/noteModel.js';

export async function createNote(username, title, content) {
    await addNote(username, title, content);
}

export async function removeNote(noteId, username) {
    await deleteNote(noteId, username);
}

export async function markImportant(noteId, username) {
    await toggleImportant(noteId, username);
}

export async function listNotes(username, onlyImportant = false) {
    return await getUserNotes(username, onlyImportant);
}
