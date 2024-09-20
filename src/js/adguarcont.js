function addDaycare() {
    // Obtener la lista de contratos
    const daycareList = document.getElementById('daycare-list');
    
    // Crear un contenedor para el nuevo contrato
    const daycareContainer = document.createElement('div');
    daycareContainer.classList.add('daycare-item-container');

    // Crear el botón del contrato
    const newContractButton = document.createElement('button');
    newContractButton.classList.add('daycare-item');
    newContractButton.textContent = `Contrato ${document.querySelectorAll('.daycare-item').length + 1}`;
    newContractButton.onclick = function() {
        location.href = 'prueba.html'; // Redirigir a la página del contrato
    };

    // Crear el botón de edición
    const editButton = document.createElement('button');
    editButton.classList.add('edit-button');
    const editIcon = document.createElement('img');
    editIcon.src = '../../assets/images/editIcon_1.png';
    editIcon.classList.add('icon');
    editButton.appendChild(editIcon);
    editButton.onclick = function() {
        editName(this); // Llamar a la función de edición
    };

    // Crear el botón de eliminación
    const deleteButton = document.createElement('button');
    deleteButton.classList.add('delete-button');
    const deleteIcon = document.createElement('img');
    deleteIcon.src = '../../assets/images/deleteIcon2.png';
    deleteIcon.classList.add('icon');
    deleteButton.appendChild(deleteIcon);
    deleteButton.onclick = function() {
        deleteDaycare(this); // Llamar a la función de eliminación
    };

    // Añadir los elementos al contenedor del nuevo contrato
    daycareContainer.appendChild(newContractButton);
    daycareContainer.appendChild(editButton);
    daycareContainer.appendChild(deleteButton);

    // Añadir el nuevo contrato a la lista
    daycareList.appendChild(daycareContainer);
}

function deleteDaycare(button) {
    // Elimina el contrato al que pertenece el botón eliminar
    const daycareContainer = button.parentElement;
    daycareContainer.remove();
}

function editName(button) {
    // Aquí puedes agregar la lógica para editar el nombre del contrato
    const contractButton = button.parentElement.querySelector('.daycare-item');
    const newName = prompt('Nuevo nombre del contrato:', contractButton.textContent);
    if (newName) {
        contractButton.textContent = newName;
    }
}
function deleteDaycare(button) {
    // Mostrar una confirmación antes de eliminar
    const confirmation = confirm("¿Estás seguro de que deseas borrar este contrato?");
    
    if (confirmation) {
        // Si el usuario confirma, procedemos a eliminar
        const daycareItemContainer = button.parentElement;
        daycareItemContainer.remove();
    }
}