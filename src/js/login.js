function showModal(message) {
  const errorModal = document.getElementById('errorModal');
  const errorMessage = document.getElementById('errorMessage');
  errorMessage.textContent = message || 'Credenciales incorrectas.';
  errorModal.classList.remove('hidden');
  errorModal.classList.add('flex');
}

function closeModal() {
  const errorModal = document.getElementById('errorModal');
  errorModal.classList.add('hidden');
  errorModal.classList.remove('flex');
}

function login(event) {
  event.preventDefault();
  const name = document.getElementById('name').value.trim();
  const password = document.getElementById('password').value;

  if (!name || !password) {
    showModal('Debes escribir usuario y contraseña.');
    return;
  }

  window.ipcRenderer.send('login', { name, password });
}

window.ipcRenderer.on('login-failed', (message) => {
  showModal(message);
});

window.login = login;
window.closeModal = closeModal;
