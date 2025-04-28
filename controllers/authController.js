import { registerUser, loginUser, deleteUser } from '../models/userModel.js';
import { deleteUserNotes } from '../models/noteModel.js';

export async function register(username, password, consent) {
    await registerUser(username, password, consent);
}

export async function login(username, password) {
    return await loginUser(username, password);
}

export async function deleteAccount(username, password) {
    await deleteUser(username, password);
    await deleteUserNotes(username);
}
