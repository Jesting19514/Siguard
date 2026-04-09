let currentButton = null;

function showModal(action, button) {
  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modal-title');
  const modalInput = document.getElementById('modal-input');
  const numGuarderiaInput = document.getElementById('num-guarderia');
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  if (action === 'add') {
    modalTitle.textContent = 'Agregar Guardería';
    modalInput.value = '';
    numGuarderiaInput.value = '';
    startDateInput.value = '';
    endDateInput.value = '';
  }

  if (action === 'edit' && button) {
    modalTitle.textContent = 'Editar Guardería';
    const daycareContainer = button.closest('.daycare-item-container');
    modalInput.value = daycareContainer.querySelector('.daycare-item').textContent;
    numGuarderiaInput.value = button.getAttribute('data-num-guarderia') || '';
    startDateInput.value = button.getAttribute('data-start-date') || '';
    endDateInput.value = button.getAttribute('data-end-date') || '';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => modalInput.focus(), 100);
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
}

function closeDeleteConfirmModal() {
  const deleteModal = document.getElementById('delete-confirm-modal');
  deleteModal.classList.add('hidden');
  deleteModal.classList.remove('flex');
}

async function editDaycare(button) {
  showModal('edit', button);

  const daycareContainer = button.closest('.daycare-item-container');
  const id = daycareContainer.getAttribute('data-id');

  document.getElementById('modal-confirm').onclick = async () => {
    const newName = document.getElementById('modal-input').value;
    const newNumGuarderia = document.getElementById('num-guarderia').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (!newName || !newNumGuarderia || !startDate || !endDate) {
      alert('Por favor, completa todos los campos antes de confirmar.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/daycares/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razon_social: newName,
          fecha_inicio: startDate,
          fecha_termino: endDate,
          num_guarderia: newNumGuarderia,
        }),
      });

      const result = await response.json();
      if (result.success) {
        closeModal();
        loadDaycares();
      }
    } catch (error) {
      console.error('Error al actualizar la guardería:', error);
    }
  };
}

function getDateInputValue(dateValue) {
  if (!dateValue) {
    return '';
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  return date.toISOString().split('T')[0];
}

async function loadDaycares() {
  const daycareList = document.getElementById('daycare-list');
  daycareList.innerHTML = '';

  try {
    const response = await fetch('http://localhost:3000/api/daycares');
    const daycares = await response.json();

    daycares.forEach((daycare) => {
      const daycareItemContainer = document.createElement('div');
      daycareItemContainer.className = 'daycare-item-container flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center';
      daycareItemContainer.setAttribute('data-id', daycare._id);

      const numGuarderiaContainer = document.createElement('span');
      numGuarderiaContainer.className = 'num-guarderia-container inline-flex w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600';
      numGuarderiaContainer.textContent = daycare.num_guarderia;

      const daycareButton = document.createElement('button');
      daycareButton.className = 'daycare-item flex-1 rounded-lg bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700 hover:bg-slate-100';
      daycareButton.textContent = daycare.razon_social;
      daycareButton.onclick = () => {
        location.href = 'adminguarCon.html';
      };

      const editButton = document.createElement('button');
      editButton.className = 'edit-button rounded-lg border border-slate-200 p-2 hover:bg-slate-100';
      editButton.onclick = () => editDaycare(editButton);
      editButton.setAttribute('data-num-guarderia', daycare.num_guarderia);
      editButton.setAttribute('data-start-date', getDateInputValue(daycare.fecha_inicio));
      editButton.setAttribute('data-end-date', getDateInputValue(daycare.fecha_termino));

      const editIcon = document.createElement('img');
      editIcon.src = '../../assets/images/editIcon_1.png';
      editIcon.className = 'icon h-5 w-5';
      editButton.appendChild(editIcon);

      const deleteButton = document.createElement('button');
      deleteButton.className = 'delete-button rounded-lg border border-slate-200 p-2 hover:bg-red-50';
      deleteButton.onclick = () => deleteDaycare(deleteButton);

      const deleteIcon = document.createElement('img');
      deleteIcon.src = '../../assets/images/deleteIcon2.png';
      deleteIcon.className = 'icon h-5 w-5';
      deleteButton.appendChild(deleteIcon);

      daycareItemContainer.append(numGuarderiaContainer, daycareButton, editButton, deleteButton);
      daycareList.appendChild(daycareItemContainer);
    });
  } catch (error) {
    console.error('Error al cargar las guarderías:', error);
  }
}

document.addEventListener('DOMContentLoaded', loadDaycares);

function deleteDaycare(button) {
  currentButton = button;
  showDeleteConfirmModal();
}

function showDeleteConfirmModal() {
  const deleteModal = document.getElementById('delete-confirm-modal');
  const confirmInput = document.getElementById('delete-confirm-input');
  const errorText = document.getElementById('delete-error');

  confirmInput.value = '';
  errorText.classList.add('hidden');
  deleteModal.classList.remove('hidden');
  deleteModal.classList.add('flex');

  setTimeout(() => confirmInput.focus(), 100);
}

function confirmDelete() {
  const daycareContainer = currentButton.closest('.daycare-item-container');
  const id = daycareContainer.getAttribute('data-id');
  const confirmInput = document.getElementById('delete-confirm-input');
  const errorText = document.getElementById('delete-error');

  if (confirmInput.value !== 'DELETE') {
    errorText.classList.remove('hidden');
    return;
  }

  fetch(`http://localhost:3000/api/daycares/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        daycareContainer.remove();
        closeDeleteConfirmModal();
      }
    })
    .catch((error) => console.error('Error al eliminar la guardería:', error));
}

function addDaycare() {
  showModal('add');

  document.getElementById('modal-confirm').onclick = async () => {
    const newRazonSocial = document.getElementById('modal-input').value;
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;
    const newNumGuarderia = document.getElementById('num-guarderia').value;

    if (!newRazonSocial || !startDate || !endDate || !newNumGuarderia) {
      alert('Por favor, completa todos los campos antes de confirmar.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/daycares', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razon_social: newRazonSocial,
          id_usuario_gerente: 1,
          fecha_inicio: startDate,
          fecha_termino: endDate,
          num_guarderia: newNumGuarderia,
        }),
      });

      const result = await response.json();
      if (result.success) {
        closeModal();
        loadDaycares();
      }
    } catch (error) {
      console.error('Error al agregar la guardería:', error);
    }
  };
}

function filterDaycares() {
  const searchTerm = document.getElementById('search-bar').value.toLowerCase();
  const daycareItems = document.querySelectorAll('.daycare-item-container');

  daycareItems.forEach((daycareItem) => {
    const name = daycareItem.querySelector('.daycare-item').textContent.toLowerCase();
    const numGuarderia = daycareItem.querySelector('.num-guarderia-container').textContent.toLowerCase();
    daycareItem.style.display = name.includes(searchTerm) || numGuarderia.includes(searchTerm) ? 'flex' : 'none';
  });
}

window.addDaycare = addDaycare;
window.filterDaycares = filterDaycares;
window.closeModal = closeModal;
window.closeDeleteConfirmModal = closeDeleteConfirmModal;
window.confirmDelete = confirmDelete;
