let currentAction = null; // Variable para saber la acción actual
let currentButton = null; // Para almacenar el botón de referencia en editar y eliminar

function showModal(action, button) {
    currentAction = action;
    currentButton = button;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalInput = document.getElementById('modal-input');

    // Limpia el campo de entrada y establece el foco
    modalInput.value = ''; // Limpia el campo de entrada
    modalInput.placeholder = ''; // Limpia el placeholder

    if (action === 'add') {
        modalTitle.textContent = 'Agregar Guardería';
        // No hay placeholder para la acción de agregar
    } else if (action === 'edit') {
        modalTitle.textContent = 'Editar Nombre de Guardería';
        modalInput.placeholder = button.previousElementSibling.textContent; // Establece el placeholder al nombre existente
        modalInput.addEventListener('focus', () => {
            modalInput.placeholder = ''; // Limpia el placeholder al hacer foco
        }, { once: true }); // Usa { once: true } para que el evento se elimine después de la primera ejecución
    } else if (action === 'delete') {
        // Muestra el modal de confirmación de eliminación en lugar de este modal
        showDeleteConfirmModal();
        return; // Sale de showModal
    }

    modal.style.display = 'block'; // Muestra el modal
setTimeout(() => modalInput.focus(), 100); // Forzar foco después de mostrar el modal

}
function showDeleteConfirmModal() {
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmInput = document.getElementById('delete-confirm-input');
    
    // Restablecer el estado del campo de entrada antes de mostrar el modal
    confirmInput.value = '';
    confirmInput.disabled = false; 
    confirmInput.placeholder = 'Escriba DELETE para confirmar'; 
    deleteModal.style.display = 'block'; 

    // Forzar el foco en el campo de entrada con un pequeño retraso
    setTimeout(() => confirmInput.focus(), 100);
}

function closeDeleteConfirmModal() {
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmInput = document.getElementById('delete-confirm-input');
    
    // Limpiar y habilitar el campo de entrada
    confirmInput.value = '';
    confirmInput.disabled = false;
    deleteModal.style.display = 'none'; 
}

function confirmDelete() {
    const confirmInput = document.getElementById('delete-confirm-input');
    const errorText = document.getElementById('delete-error'); // Asegúrate de tener un elemento de error en el HTML con este ID
errorText.style.display = 'block';

    if (confirmInput.value === 'DELETE') {
        const daycareItem = currentButton.parentElement;
        daycareItem.remove(); // Eliminar el elemento de la lista
        closeDeleteConfirmModal(); // Cerrar el modal de confirmación de eliminación
    } else {
        // Muestra el mensaje de error
        errorText.style.display = 'block';
        console.log("Mostrando mensaje de error."); // Mensaje de depuración

        // Restablecer y reenfocar el campo de entrada
        confirmInput.value = ''; 
        confirmInput.disabled = false;

        // Forzar el foco nuevamente
        setTimeout(() => confirmInput.focus(), 100);
    }
}




function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
    const modalInput = document.getElementById('modal-input');
    modalInput.style.display = 'block'; // Show input again after closing
}

function modalConfirm() {
    const modalInput = document.getElementById('modal-input');
    const daycareList = document.getElementById('daycare-list');

    if (currentAction === 'add') {
        const daycareName = modalInput.value;
        if (daycareName && daycareName.length <= 150) {
            const newDaycare = document.createElement('div');
            newDaycare.className = 'daycare-item-container';
            newDaycare.innerHTML = `
                <button class="daycare-item" onclick="location.href='prueba.html'">${daycareName}</button>
                <button class="edit-button" onclick="editName(this)"><img src="../../assets/images/editIcon_1.png" class="icon"></button>
                <button class="delete-button" onclick="deleteDaycare(this)"><img src="../../assets/images/deleteIcon2.png" class="icon"></button>
            `;
            daycareList.appendChild(newDaycare);
        } else {
            alert("El nombre de la guardería no puede tener más de 150 caracteres.");
        }
    } else if (currentAction === 'edit') {
        const newName = modalInput.value;
        if (newName && newName.length <= 150) {
            currentButton.previousElementSibling.textContent = newName;
        } else {
            alert("El nombre de la guardería no puede tener más de 150 caracteres.");
        }
    }

    closeModal(); // Close the modal after action
}

function addDaycare() {
    showModal('add');
}

function editName(button) {
    showModal('edit', button);
}

function deleteDaycare(button) {
    currentButton = button; // Store reference to the button for delete confirmation
    showModal('delete', button);
}

function showDeleteConfirmModal() {
    const deleteModal = document.getElementById('delete-confirm-modal');
    const confirmInput = document.getElementById('delete-confirm-input');
    const errorText = document.getElementById('delete-error');

    confirmInput.value = '';
    confirmInput.disabled = false;
    confirmInput.placeholder = 'Escriba DELETE para confirmar'; 
    deleteModal.style.display = 'block';
    
    // Oculta el mensaje de error si se mostró previamente
    errorText.style.display = 'none';
    
    setTimeout(() => confirmInput.focus(), 100);
}

function showTestNotification() {
    // Asegúrate de que el código se ejecute en el contexto de Electron
    const { Notification } = require('electron'); // Asegúrate de requerir el módulo de notificaciones de Electron

    const notification = {
        title: 'Notificación de Test',
        body: 'Esto es un test de notificación.',
    };

    new Notification(notification).show(); // Muestra la notificación
}

function sendTestNotification() {
    window.ipcRenderer.send('send-notification', 'Siguard', 'Este es un mensaje de prueba.');
}

async function loadDaycares() {
    console.log("Cargando guarderías..."); // Agrega esto para verificar
    const daycareList = document.getElementById('daycare-list');
    daycareList.innerHTML = ''; 
  
    try {
      const response = await fetch('http://localhost:3000/api/daycares'); 
      const daycares = await response.json();
      console.log(daycares); // Agrega esto para verificar los datos recibidos
  
      daycares.forEach(daycare => {
        const daycareItemContainer = document.createElement('div');
        daycareItemContainer.classList.add('daycare-item-container');
  
        const daycareButton = document.createElement('button');
        daycareButton.classList.add('daycare-item');
        daycareButton.textContent = daycare.razon_social;
        daycareButton.onclick = () => location.href = 'adminguarCon.html';
  
        const editButton = document.createElement('button');
        editButton.classList.add('edit-button');
        editButton.onclick = () => editName(editButton);
        const editIcon = document.createElement('img');
        editIcon.src = '../../assets/images/editIcon_1.png';
        editIcon.classList.add('icon');
        editButton.appendChild(editIcon);
  
        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = () => deleteDaycare(deleteButton);
        const deleteIcon = document.createElement('img');
        deleteIcon.src = '../../assets/images/deleteIcon2.png';
        deleteIcon.classList.add('icon');
        deleteButton.appendChild(deleteIcon);
  
        daycareItemContainer.appendChild(daycareButton);
        daycareItemContainer.appendChild(editButton);
        daycareItemContainer.appendChild(deleteButton);
  
        daycareList.appendChild(daycareItemContainer);
      });
    } catch (error) {
      console.error("Error al cargar las guarderías:", error);
    }
  }
  
  document.addEventListener('DOMContentLoaded', loadDaycares);
  
  