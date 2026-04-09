(() => {
  let selectedButton = null;
  let selectedDaycare = null;
  const disabledButtons = new Set();
  const modifiedButtons = new Set();

  function formatDate(dateString) {
    if (!dateString) return '--/--/----';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '--/--/----';
    return date.toLocaleDateString('es-ES');
  }

  function getDocumentDateValue(dateField) {
    if (!dateField) return '';
    if (typeof dateField === 'string') return dateField;
    if (dateField.$date) return dateField.$date;
    return '';
  }

  function updateHeader(daycare) {
    const title = document.querySelector('.content h1');
    const contractDates = document.querySelector('.contract-dates');
    if (!daycare) {
      title.textContent = 'Guardería';
      contractDates.textContent = 'Contrato no disponible';
      return;
    }

    title.textContent = daycare.razon_social;
    contractDates.textContent = `Contrato: De ${formatDate(daycare.fecha_inicio)} a ${formatDate(daycare.fecha_termino)}`;
  }

  async function fetchDaycare(daycareId) {
    const response = await fetch(`http://localhost:3000/api/daycares/${daycareId}`);
    const payload = await response.json();
    return payload.success ? payload.daycare : null;
  }

  async function fetchDocuments(daycareNumber) {
    const response = await fetch(`http://localhost:3000/api/documents?daycareNumber=${encodeURIComponent(daycareNumber)}`);
    return response.json();
  }

  async function createDocumentForDaycare(payload) {
    const response = await fetch('http://localhost:3000/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return response.json();
  }

  function convertToDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(`${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
  }

  function checkDatesAndUpdate() {
    const today = new Date().setHours(0, 0, 0, 0);

    document.querySelectorAll('.daycare-item').forEach((button) => {
      const dateText = button.querySelector('.date-text');
      const checkbox = button.nextElementSibling.nextElementSibling;

      if (dateText && checkbox && !checkbox.checked) {
        const startDateText = dateText.innerHTML.split('Fecha de inicio: ')[1].split('<br>')[0];
        const endDateText = dateText.innerHTML.split('Fecha de término: ')[1];

        const startDate = convertToDate(startDateText);
        const endDate = convertToDate(endDateText);
        const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.max(0, Math.round((endDate - today) / (1000 * 60 * 60 * 24)));

        if (daysRemaining <= 14) {
          button.style.boxShadow = '0 5px 5px rgba(241, 2, 2, 0.692)';
        } else if (daysRemaining > totalDays / 2) {
          button.style.boxShadow = '0 5px 5px rgba(0, 255, 0, 0.692)';
        } else {
          button.style.boxShadow = '0 5px 5px rgba(255, 145, 0, 0.692)';
        }
      }
    });
  }

  function buildDocumentRow(doc) {
    const container = document.createElement('div');
    container.className = 'daycare-item-container flex flex-col gap-2 rounded-xl border border-slate-200 p-3 sm:flex-row sm:items-center';

    const button = document.createElement('button');
    button.className = 'daycare-item flex-1 rounded-lg bg-slate-50 px-4 py-3 text-left font-semibold text-slate-700';
    const startDate = getDocumentDateValue(doc.fecha_inicio);
    const endDate = getDocumentDateValue(doc.fecha_termino);
    button.innerHTML = `${doc.nombreDoc || 'Documento'}<br><span class="date-text">Fecha de inicio: ${formatDate(startDate)}<br>Fecha de término: ${formatDate(endDate)}</span>`;

    const editButton = document.createElement('button');
    editButton.className = 'edit-button rounded-lg border border-slate-200 p-2 hover:bg-slate-100';
    editButton.innerHTML = '<img src="../../assets/images/editafecha.png" class="icon h-5 w-5" alt="Editar fechas">';
    editButton.onclick = () => window.openDatePicker(editButton);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'edit-checkbox h-5 w-5 rounded border-slate-300';
    checkbox.onclick = () => window.toggleCheckbox(checkbox);

    container.append(button, editButton, checkbox);
    return container;
  }

  function toggleEmptyState(hasDocuments) {
    const emptyMessage = document.getElementById('empty-documents-message');
    if (!emptyMessage) return;
    emptyMessage.classList.toggle('hidden', hasDocuments);
  }

  window.openDatePicker = function(button) {
    const associatedButton = button.previousElementSibling;
    const checkbox = button.nextElementSibling;

    if (checkbox.checked && associatedButton.style.boxShadow.includes('rgba(128, 128, 128') && !modifiedButtons.has(associatedButton)) {
      selectedButton = associatedButton;
      document.getElementById('date-modal').style.display = 'flex';
    } else {
      alert('Solo puedes modificar la fecha si el estado está en gris y el checkbox está marcado.');
    }
  };

  window.closeModal = function() {
    document.getElementById('date-modal').style.display = 'none';
  };

  window.openCreateDocumentModal = function() {
    if (!selectedDaycare) {
      alert('No se encontró la guardería seleccionada.');
      return;
    }
    document.getElementById('document-name').value = '';
    document.getElementById('document-start-date').value = '';
    document.getElementById('document-end-date').value = '';
    document.getElementById('create-document-modal').classList.remove('hidden');
    document.getElementById('create-document-modal').classList.add('flex');
  };

  window.closeCreateDocumentModal = function() {
    document.getElementById('create-document-modal').classList.add('hidden');
    document.getElementById('create-document-modal').classList.remove('flex');
  };

  window.createDocument = async function() {
    if (!selectedDaycare) {
      alert('No se encontró la guardería seleccionada.');
      return;
    }

    const nombreDoc = document.getElementById('document-name').value.trim();
    const fecha_inicio = document.getElementById('document-start-date').value;
    const fecha_termino = document.getElementById('document-end-date').value;

    if (!nombreDoc || !fecha_inicio || !fecha_termino) {
      alert('Completa todos los campos para crear el documento.');
      return;
    }

    if (new Date(fecha_inicio) > new Date(fecha_termino)) {
      alert('La fecha inicial no puede ser mayor que la fecha final.');
      return;
    }

    const result = await createDocumentForDaycare({
      nombreDoc,
      fecha_inicio,
      fecha_termino,
      num_guarderia: selectedDaycare.num_guarderia,
      id_guarderia: selectedDaycare._id,
    });

    if (!result.success) {
      alert(result.message || 'No se pudo crear el documento.');
      return;
    }

    window.closeCreateDocumentModal();
    await window.reloadDocuments();
  };

  window.reloadDocuments = async function() {
    if (!selectedDaycare) {
      return;
    }
    const docs = await fetchDocuments(selectedDaycare.num_guarderia);
    const list = document.getElementById('daycare-list');
    list.innerHTML = '';

    docs.forEach((doc) => {
      list.appendChild(buildDocumentRow(doc));
    });

    toggleEmptyState(docs.length > 0);

    document.querySelectorAll('.daycare-item').forEach((button) => {
      button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)';
    });

    checkDatesAndUpdate();
  };

  window.saveDates = function() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
      const buttonContent = selectedButton.textContent.split('Fecha de inicio')[0].trim();
      selectedButton.innerHTML = `${buttonContent}<br><span class="date-text">Fecha de inicio: ${formatDate(startDate)}<br>Fecha de término: ${formatDate(endDate)}</span>`;
      window.closeModal();
      modifiedButtons.add(selectedButton);
      const checkbox = selectedButton.nextElementSibling.nextElementSibling;
      if (checkbox.checked) {
        checkbox.checked = false;
        window.toggleCheckbox(checkbox);
      }
      checkDatesAndUpdate();
    } else {
      alert('Por favor, selecciona ambas fechas y asegúrate de que la fecha inicial no sea posterior a la fecha final.');
    }
  };

  window.toggleCheckbox = function(checkbox) {
    const button = checkbox.previousElementSibling.previousElementSibling;
    if (checkbox.checked) {
      button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)';
      disabledButtons.add(button);
    } else {
      disabledButtons.delete(button);
      checkDatesAndUpdate();
    }
  };

  window.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const daycareId = params.get('daycareId');
    if (!daycareId) {
      updateHeader(null);
      return;
    }

    selectedDaycare = await fetchDaycare(daycareId);
    updateHeader(selectedDaycare);
    if (!selectedDaycare) {
      toggleEmptyState(false);
      return;
    }
    await window.reloadDocuments();
  });
})();
