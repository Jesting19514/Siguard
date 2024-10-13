let currentAction = null; 
let currentButton = null; 

function showModal(action, button) {
    currentAction = action;
    currentButton = button;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalInput = document.getElementById('modal-input');
    const deleteModal = document.getElementById('delete-confirm-modal'); 


    if (action === 'add') {
        modalTitle.textContent = 'Agregar Guardería';
        modalInput.value = '';
        modalInput.placeholder = 'Ingrese el nombre de la guardería';
        modal.style.display = 'block';
        setTimeout(() => modalInput.focus(), 100);
    } else if (action === 'edit') {
        modalTitle.textContent = 'Editar Nombre de Guardería';
        modalInput.value = '';
        modalInput.placeholder = button.previousElementSibling.textContent;
        modalInput.addEventListener('focus', () => {
            modalInput.placeholder = '';
        }, { once: true });
        modal.style.display = 'block';
        setTimeout(() => modalInput.focus(), 100);
    } else if (action === 'delete') {
        showDeleteConfirmModal();
        return;
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function closeDeleteConfirmModal() {
    const deleteModal = document.getElementById('delete-confirm-modal');
    deleteModal.style.display = 'none';
}

async function editDaycare(button) {
    showModal('edit', button);

    const daycareContainer = button.closest('.daycare-item-container');
    const id = daycareContainer.getAttribute('data-id');
    const currentRazonSocial = button.previousElementSibling.textContent;
    const currentNumGuarderia = button.getAttribute('data-num-guarderia'); // Obtén el número de guardería actual

    // Llena los campos del modal con la información actual
    document.getElementById('modal-input').value = currentRazonSocial;
    document.getElementById('num-guarderia').value = currentNumGuarderia;

    document.getElementById('modal-confirm').onclick = async () => {
        const newName = document.getElementById('modal-input').value;
        const newNumGuarderia = document.getElementById('num-guarderia').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (newName && newNumGuarderia && startDate && endDate) {
            const messageContainer = document.createElement('div');
            messageContainer.textContent = "Espere un segundo...";
            messageContainer.style.color = "blue"; 
            messageContainer.style.marginTop = "10px"; 
            const modalContent = document.querySelector('.modal-content'); 
            modalContent.appendChild(messageContainer); 

            try {
                const response = await fetch(`http://localhost:3000/api/daycares/${id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        razon_social: newName,
                        fecha_inicio: startDate,
                        fecha_termino: endDate,
                        num_guarderia: newNumGuarderia
                    })
                });

                const result = await response.json();
                if (result.success) {
                    closeModal(); 
                    loadDaycares(); 
                } else {
                    console.error('Error:', result.message);
                }
            } catch (error) {
                console.error('Error al actualizar la guardería:', error);
            } finally {
                setTimeout(() => {
                    messageContainer.remove(); 
                }, 1000);
            }
        } else {
            alert("Por favor, completa todos los campos antes de confirmar.");
        }
    };
}




async function loadDaycares() {
    const daycareList = document.getElementById('daycare-list');
    daycareList.innerHTML = ''; 

    try {
        const response = await fetch('http://localhost:3000/api/daycares'); 
        const daycares = await response.json();

        daycares.forEach(daycare => {
            const daycareItemContainer = document.createElement('div');
            daycareItemContainer.classList.add('daycare-item-container');
            daycareItemContainer.setAttribute('data-id', daycare._id);

            const daycareButton = document.createElement('button');
            daycareButton.classList.add('daycare-item');
            daycareButton.textContent = daycare.razon_social;
            daycareButton.onclick = () => location.href = 'adminguarCon.html';

            const editButton = document.createElement('button');
            editButton.classList.add('edit-button');
            editButton.onclick = () => editDaycare(editButton);  // Actualiza aquí para usar `editDaycare`
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


function deleteDaycare(button) {
    currentButton = button; 
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

   
    errorText.style.display = 'none';

    setTimeout(() => confirmInput.focus(), 100);
}


function confirmDelete() {
    const daycareContainer = currentButton.closest('.daycare-item-container');
    const id = daycareContainer.getAttribute('data-id');
    const confirmInput = document.getElementById('delete-confirm-input');
    const errorText = document.getElementById('delete-error');

   
    errorText.style.display = 'none'; 

    if (confirmInput.value === 'DELETE') {
        fetch(`http://localhost:3000/api/daycares/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
        })
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    daycareContainer.remove(); 
                    closeDeleteConfirmModal(); 
                } else {
                    console.error('Error:', result.message);
                }
            })
            .catch(error => console.error('Error al eliminar la guardería:', error));
    } else {
        
        errorText.textContent = '¡Confirmación incorrecta! Escriba DELETE para continuar.';
        errorText.style.display = 'block'; 
       
    }
}


function sendTestNotification() {
    const title = 'Hola mundo';
    const body = 'ESTO ES UNA PRUEBA';
    window.ipcRenderer.send('send-notification', title, body); 
}

    

async function addDaycare() {
    showModal('add');   

    document.getElementById('modal-confirm').onclick = async () => {
        const newRazonSocial = document.getElementById('modal-input').value;
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (newRazonSocial && startDate && endDate) {
            const randomId = Math.floor(Math.random() * 10000).toString(); 

            const messageContainer = document.createElement('div');
            messageContainer.textContent = "Espere un segundo...";
            messageContainer.style.color = "blue";
            messageContainer.style.marginTop = "10px"; 
            const modalContent = document.querySelector('.modal-content'); 
            modalContent.appendChild(messageContainer); 

            try {
                const response = await fetch('http://localhost:3000/api/daycares', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        _id: randomId,
                        razon_social: newRazonSocial,
                        id_usuario_gerente: 1,
                        fecha_inicio: startDate,
                        fecha_termino: endDate
                    })
                });

                const result = await response.json();
                if (result.success) {
                    closeModal(); 
                    loadDaycares(); 
                } else {
                    console.error('Error:', result.message);
                }
            } catch (error) {
                console.error('Error al agregar la guardería:', error);
            } finally {
                setTimeout(() => {
                    messageContainer.remove(); 
                }, 1000);
            }
        } else {
            alert("Por favor, completa todos los campos antes de confirmar.");
        }
    };
}
function filterDaycares() {
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();
    const daycareItems = document.querySelectorAll('.daycare-item-container');

    daycareItems.forEach(daycareItem => {
        const name = daycareItem.querySelector('.daycare-item').textContent.toLowerCase();
        if (name.includes(searchTerm)) {
            daycareItem.style.display = 'flex'; // Mostrar el elemento si coincide con la búsqueda.
        } else {
            daycareItem.style.display = 'none'; // Ocultar el elemento si no coincide.
        }
    });
}
