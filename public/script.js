const username = localStorage.getItem('username');
if (!username) {
  window.location.href = 'index.html';
}

const notesList = document.getElementById('notesList');
const form = document.getElementById('noteForm');
const filterImportant = document.getElementById('filterImportant');
const deleteAccountBtn = document.getElementById('deleteAccountBtn');
const message = document.getElementById('message');

// Načíst poznámky
async function loadNotes() {
  const res = await fetch(`/api/notes/${username}`);
  let notes = await res.json();

  if (filterImportant.checked) {
    notes = notes.filter(note => note.important);
  }

  notesList.innerHTML = '';
  notes.forEach(note => {
    const li = document.createElement('li');
    li.innerHTML = `
      <strong>${note.title}</strong> (${new Date(note.date).toLocaleString()})<br/>
      ${note.text}<br/>
      <button onclick="toggleImportant('${note.id}')">
        ${note.important ? 'Odebrat důležitost' : 'Označit jako důležitá'}
      </button>
      <button onclick="deleteNote('${note.id}')">Smazat</button>
      <hr/>
    `;
    notesList.appendChild(li);
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = {
    username,
    title: form.title.value,
    text: form.text.value
  };

  const res = await fetch('/api/notes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    form.reset();
    loadNotes();
  }
});

filterImportant.addEventListener('change', loadNotes);

async function toggleImportant(id) {
  await fetch(`/api/notes/${id}/important`, {
    method: 'PATCH'
  });
  loadNotes();
}

async function deleteNote(id) {
  await fetch(`/api/notes/${id}`, {
    method: 'DELETE'
  });
  loadNotes();
}

deleteAccountBtn.addEventListener('click', async () => {
  const confirmed = confirm('Opravdu chcete zrušit účet?');
  if (!confirmed) return;

  const password = prompt('Zadejte své heslo pro potvrzení:');
  const res = await fetch('/api/auth/delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();
  message.innerText = result.message;

  if (res.ok) {
    localStorage.removeItem('username');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1500);
  }
});

function logout() {
  localStorage.removeItem('username');
  window.location.href = 'index.html';
}

loadNotes();