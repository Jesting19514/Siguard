let selectedButton = null;
let selectedDocument = null;
const notifiedDocuments = new Set();

function openDatePicker(button) {
  selectedButton = button.previousElementSibling;
  selectedDocument = {
    id: button.getAttribute('data-document-id'),
  };
  document.getElementById('date-modal').style.display = 'block';
}

function closeModal() {
  document.getElementById('date-modal').style.display = 'none';
}

function formatDate(dateString) {
  if (!dateString) {
    return '--/--/----';
  }
  const date = parseDateAsLocal(dateString);
  if (!date) {
    return '--/--/----';
  }
  return date.toLocaleDateString('es-ES');
}

function parseDateAsLocal(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;

  if (typeof value === 'string') {
    const dateOnlyMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (dateOnlyMatch) {
      const [, year, month, day] = dateOnlyMatch;
      return new Date(Number(year), Number(month) - 1, Number(day));
    }
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function updateHeader(daycare) {
  const title = document.querySelector('.content h1');
  const contractDates = document.querySelector('.contract-dates');

  if (!daycare) {
    title.textContent = 'Guardería';
    contractDates.textContent = 'Contrato no disponible';
    return;
  }

  title.textContent = daycare.razon_social || 'Guardería';
  contractDates.textContent = `Contrato: De ${formatDate(daycare.fecha_inicio)} a ${formatDate(daycare.fecha_termino)}`;
}

function getSelectedDaycare() {
  const params = new URLSearchParams(window.location.search);
  const daycareId = params.get('daycareId');
  const cached = localStorage.getItem('selectedDaycare');

  if (cached) {
    try {
      const parsed = JSON.parse(cached);
      if (!daycareId || String(parsed._id) === daycareId) {
        return parsed;
      }
    } catch {
      return null;
    }
  }

  return null;
}

async function fetchSelectedDaycare(daycareId) {
  if (!daycareId) {
    return null;
  }

  const response = await fetch(`http://localhost:3000/api/daycares/${daycareId}`);
  const result = await response.json();
  if (result.success) {
    localStorage.setItem('selectedDaycare', JSON.stringify(result.daycare));
    return result.daycare;
  }

  return null;
}

function getDocumentDateValue(dateField) {
  if (!dateField) {
    return '';
  }
  if (typeof dateField === 'string') {
    return dateField;
  }
  if (dateField.$date) {
    return dateField.$date;
  }
  return '';
}

function updateButtonStyles(button, daysRemaining) {
  if (daysRemaining > 40) {
    button.style.boxShadow = '0 5px 5px rgba(0, 255, 0, 0.692)';
  } else if (daysRemaining <= 40 && daysRemaining > 20) {
    button.style.boxShadow = '0 5px 5px rgba(255, 145, 0, 0.692)';
  } else {
    button.style.boxShadow = '0 5px 5px rgba(241, 2, 2, 0.692)';
  }
}

function maybeNotifyDocumentExpiration(documentName, endDate, daysRemaining) {
  if (!window.ipcRenderer || typeof window.ipcRenderer.send !== 'function') {
    return;
  }

  const notificationKey = `${documentName}-${endDate.getTime()}`;
  if (notifiedDocuments.has(notificationKey)) {
    return;
  }

  window.ipcRenderer.send('send-notification', {
    title: 'Documento próximo a vencer',
    body: `${documentName} vence el ${endDate.toLocaleDateString('es-ES')} (faltan ${daysRemaining} días).`,
  });
  notifiedDocuments.add(notificationKey);
}

function sortDocuments() {
  const container = document.getElementById('daycare-list');
  const items = Array.from(container.children);

  items.sort((a, b) => {
    const boxA = getComputedStyle(a.querySelector('.daycare-item')).boxShadow;
    const boxB = getComputedStyle(b.querySelector('.daycare-item')).boxShadow;
    const rank = (boxShadow) => {
      if (boxShadow.includes('241, 2, 2')) return 1;
      if (boxShadow.includes('255, 145, 0')) return 2;
      if (boxShadow.includes('0, 255, 0')) return 3;
      return 4;
    };
    return rank(boxA) - rank(boxB);
  });

  items.forEach((item) => container.appendChild(item));
}

function toggleDates(button) {
  const dateText = button.querySelector('.date-text');
  if (!dateText) return;
  dateText.style.display = getComputedStyle(dateText).display === 'none' ? 'block' : 'none';
}

async function fetchDocuments() {
  const daycare = getSelectedDaycare();
  if (!daycare) {
    return;
  }

  updateHeader(daycare);
  const response = await fetch(`http://localhost:3000/api/documents?daycareNumber=${encodeURIComponent(daycare.num_guarderia)}`);
  const documents = await response.json();
  const container = document.getElementById('daycare-list');
  container.innerHTML = '';

  documents.forEach((doc) => {
    const startDateRaw = getDocumentDateValue(doc.fecha_inicio);
    const endDateRaw = getDocumentDateValue(doc.fecha_termino);

    const itemContainer = document.createElement('div');
    itemContainer.classList.add('daycare-item-container');

    const button = document.createElement('button');
    button.classList.add('daycare-item');
    button.innerHTML = `
      ${doc.nombreDoc || 'Documento'}<br>
      <span class="date-text">Fecha de inicio: ${formatDate(startDateRaw)}<br>Fecha de término: ${formatDate(endDateRaw)}</span>
    `;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endDate = parseDateAsLocal(endDateRaw);
    const normalizedEndDate = endDate ? new Date(endDate) : null;
    if (normalizedEndDate) {
      normalizedEndDate.setHours(0, 0, 0, 0);
    }
    const daysRemaining = !normalizedEndDate
      ? 0
      : Math.max(0, Math.round((normalizedEndDate - today) / (1000 * 60 * 60 * 24)));
    updateButtonStyles(button, daysRemaining);
    if (normalizedEndDate && daysRemaining <= 14) {
      maybeNotifyDocumentExpiration(doc.nombreDoc || 'Documento', normalizedEndDate, daysRemaining);
    }
    button.addEventListener('click', () => toggleDates(button));

    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    editButton.setAttribute('data-document-id', doc._id);
    editButton.onclick = () => openDatePicker(editButton);

    const icon = document.createElement('img');
    icon.src = '../../assets/images/editafecha.png';
    icon.classList.add('icon');
    editButton.appendChild(icon);

    itemContainer.append(button, editButton);
    container.appendChild(itemContainer);
  });

  sortDocuments();
}

async function saveDates() {
  const startDateInput = document.getElementById('start-date');
  const endDateInput = document.getElementById('end-date');

  if (!selectedButton || !startDateInput.value || !endDateInput.value) {
    alert('Por favor, selecciona ambas fechas.');
    return;
  }

  const startDate = new Date(startDateInput.value);
  const endDate = new Date(endDateInput.value);
  if (endDate <= startDate) {
    alert('La fecha final debe ser posterior a la fecha inicial.');
    return;
  }

  if (!selectedDocument?.id) {
    alert('No se pudo identificar el documento a editar.');
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/api/documents/${encodeURIComponent(selectedDocument.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fecha_inicio: startDateInput.value,
        fecha_termino: endDateInput.value,
      }),
    });
    const result = await response.json();

    if (!response.ok || !result.success) {
      alert(result.message || 'No se pudieron guardar las fechas del documento.');
      return;
    }
  } catch (error) {
    console.error('Error al guardar las fechas del documento:', error);
    alert('Ocurrió un error al guardar las fechas del documento.');
    return;
  }

  closeModal();
  startDateInput.value = '';
  endDateInput.value = '';
  await fetchDocuments();
}

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const daycareId = params.get('daycareId');

  if (!getSelectedDaycare() && daycareId) {
    await fetchSelectedDaycare(daycareId);
  }

  await fetchDocuments();
});

window.closeModal = closeModal;
window.saveDates = saveDates;
