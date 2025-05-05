import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  registerUser,
  loginUser,
  deleteAccount,
  addNote,
  getNotes,
  deleteNote,
  markImportant
} from './services/dbService.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

// Cesta k veřejné složce (pro HTML, CSS, JS)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors());
app.use(express.json());

// -------- API ROUTES --------

// Registrace
app.post('/api/auth/register', async (req, res) => {
  const { username, password, agree } = req.body;
  if (!agree) return res.status(400).json({ message: 'Musíte souhlasit s podmínkami.' });

  try {
    await registerUser(username, password);
    res.status(201).json({ message: 'Registrace úspěšná.' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Přihlášení
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const success = await loginUser(username, password);
  if (success) {
    res.json({ message: 'Přihlášení úspěšné.' });
  } else {
    res.status(401).json({ message: 'Neplatné jméno nebo heslo.' });
  }
});

// Zrušení účtu
app.delete('/api/auth/delete', async (req, res) => {
  const { username, password } = req.body;
  const success = await deleteAccount(username, password);
  if (success) {
    res.json({ message: 'Účet byl zrušen.' });
  } else {
    res.status(400).json({ message: 'Neplatné heslo nebo uživatel neexistuje.' });
  }
});

// Přidání poznámky
app.post('/api/notes', async (req, res) => {
  const { username, title, text } = req.body;
  await addNote(username, title, text);
  res.status(201).json({ message: 'Poznámka přidána.' });
});

// Načtení poznámek
app.get('/api/notes/:username', async (req, res) => {
  const notes = await getNotes(req.params.username);
  res.json(notes);
});

// Smazání poznámky
app.delete('/api/notes/:id', async (req, res) => {
  await deleteNote(req.params.id);
  res.json({ message: 'Poznámka smazána.' });
});

// Označení jako důležitá
app.patch('/api/notes/:id/important', async (req, res) => {
  await markImportant(req.params.id);
  res.json({ message: 'Poznámka aktualizována.' });
});

// Spuštění serveru
app.listen(PORT, () => {
  console.log(`Server běží na http://localhost:${PORT}`);
});
