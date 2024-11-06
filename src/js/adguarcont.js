let selectedButton = null; // Variable para almacenar el botón seleccionado
let existingDates = {}; // Objeto para almacenar fechas existentes para todos los documentos

// Abrir el selector de fechas cuando se hace clic en el botón de edición
function openDatePicker(button) {
    selectedButton = button.previousElementSibling; // Almacenar el botón del documento asociado
    document.getElementById('date-modal').style.display = 'block'; // Mostrar el modal
}

function closeModal() {
    document.getElementById('date-modal').style.display = 'none'; // Ocultar el modal
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getUTCDate()).padStart(2, '0'); // getUTCDate para obtener la fecha correcta
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth para obtener el mes correcto
    const year = String(date.getUTCFullYear()).slice(-2); // Solo dos dígitos del año
    return `${day}/${month}/${year}`;
}
async function loadDocuments() {
    const documentList = document.getElementById('daycare-list'); // Cambia el nombre si es necesario
    documentList.innerHTML = ''; 

    try {
        const response = await fetch('http://localhost:3000/api/documentos'); 
        const documentos = await response.json();

        documentos.forEach(documento => {
            const documentItemContainer = document.createElement('div');
            documentItemContainer.classList.add('daycare-item-container');
            documentItemContainer.setAttribute('data-id', documento._id);

            const documentButton = document.createElement('button');
            documentButton.classList.add('daycare-item'); // Cambia la clase si es necesario
            documentButton.textContent = documento.nombreDoc; // Usa el campo de nombre adecuado
            documentButton.onclick = () => location.href = 'adminguarCon.html';

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

            documentItemContainer.appendChild(documentButton);
            documentItemContainer.appendChild(editButton);
            documentItemContainer.appendChild(deleteButton);

            documentList.appendChild(documentItemContainer);
        });
    } catch (error) {
        console.error("Error al cargar los documentos:", error);
    }
}
function validateDates(startDate, endDate) {
    const today = new Date().setHours(0, 0, 0, 0); // Obtener la fecha actual, ignorando la hora
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    
    if (start < today) {
        alert('La fecha de inicio no puede ser en el pasado.');
        return false;
    }
    if (start >= end) {
        alert('La fecha de inicio debe ser anterior a la fecha de término.');
        return false;
    }
    if (start == end) {
        alert('La fecha final no puede ser la misma que la fecha de inicio.');
        return false;
    }
    return true;
}
document.addEventListener('DOMContentLoaded', () => {
    fetchDocuments(); // Llamada para obtener los documentos al cargar la página
});

async function fetchDocuments() {
    try {
        const response = await fetch('http://localhost:3000/api/documents');
        const documents = await response.json();
        const container = document.getElementById('daycare-list');
        container.innerHTML = '';

        documents.forEach(doc => {
            const itemContainer = document.createElement('div');
            itemContainer.classList.add('daycare-item-container');

            const button = document.createElement('button');
            button.classList.add('daycare-item');
            button.innerHTML = `
                ${doc.nombreDoc} (Guardería: ${doc.num_guarderia})<br>
                <span class="date-text">Fecha de inicio: ${formatDate(doc.fecha_inicio.$date)}<br>
                Fecha de término: ${formatDate(doc.fecha_termino.$date)}</span>
            `;

            const today = new Date().setHours(0, 0, 0);
            const endDate = new Date(doc.fecha_termino.$date).setHours(0, 0, 0);
            const daysRemaining = Math.max(0, Math.round((endDate - today) / (1000 * 60 * 60 * 24)));
            updateButtonStyles(button, daysRemaining);
            button.addEventListener('click', () => toggleDates(button));

            const editButton = createIconButton('../../assets/images/editafecha.png', () => openDatePicker(editButton));
            itemContainer.appendChild(button);
            itemContainer.appendChild(editButton);
            container.appendChild(itemContainer);
        });

        sortDocuments();
    } catch (error) {
        console.error('Error al obtener los documentos:', error);
    }
}

function createIconButton(iconSrc, onClick) {
    const button = document.createElement('button');
    button.classList.add('edit-button');
    const icon = document.createElement('img');
    icon.src = iconSrc;
    icon.classList.add('icon');
    button.appendChild(icon);
    button.addEventListener('click', onClick);
    return button;
}


// Función para formatear las fechas
function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

function saveDates() {
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    const startDate = new Date(startDateInput.value);
    const endDate = new Date(endDateInput.value);

    // Verificar si ambas fechas están seleccionadas
    if (startDateInput.value && endDateInput.value) {
        
        // Verificar si la fecha de finalización es anterior o igual a la fecha de inicio
        if (endDate <= startDate) {
            alert('La fecha final debe ser posterior a la fecha inicial.');
            return; // Detener la ejecución de la función si las fechas no son válidas
        }

        const formattedStartDate = formatDate(startDateInput.value);
        const formattedEndDate = formatDate(endDateInput.value);

        // Asegurarse de que el botón solo contenga el nombre, sin fechas previas
        const buttonContent = selectedButton ? selectedButton.textContent.split('Fecha de inicio')[0].trim() : '';

        // Actualizar el contenido del botón con el nombre del documento y las nuevas fechas
        if (selectedButton) {
            selectedButton.innerHTML = `${buttonContent}<br><span class="date-text">Fecha de inicio: ${formattedStartDate}<br>Fecha de término: ${formattedEndDate}</span>`;
        }

        closeModal(); // Ocultar el modal después de guardar las fechas

        // Limpiar los campos de fecha
        startDateInput.value = '';
        endDateInput.value = '';

        // Verificar fechas y actualizar los colores
        checkDatesAndUpdate();
        
        // Llamar a la función de ordenar documentos
        sortDocuments(); // Organizar los documentos según la nueva prioridad
    } else {
        alert('Por favor, selecciona ambas fechas.');
    }
}
// Alternar la visibilidad de las fechas al hacer clic en el botón del documento
function toggleDates(button) {
    const dateText = button.querySelector('.date-text');
    if (dateText) {
        const currentDisplay = getComputedStyle(dateText).display;
        
        if (currentDisplay === 'none') {
            dateText.style.display = 'block'; // Mostrar fechas
        } else {
            dateText.style.display = 'none'; // Ocultar fechas
        }
    }
}

function convertToDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(`20${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

function updateButtonStyles(button, daysRemaining) {
    if (daysRemaining > 40) {
        button.style.boxShadow = '0 5px 5px rgba(0, 255, 0, 0.692)'; // Verde
        button.classList.remove('priority-high', 'priority-medium');
        button.classList.add('priority-low');
    } else if (daysRemaining <= 40 && daysRemaining > 20) {
        button.style.boxShadow = '0 5px 5px rgba(255, 145, 0, 0.692)'; // Naranja
        button.classList.remove('priority-high', 'priority-low');
        button.classList.add('priority-medium');
    } else {
        button.style.boxShadow = '0 5px 5px rgba(241, 2, 2, 0.692)'; // Rojo
        button.classList.remove('priority-medium', 'priority-low');
        button.classList.add('priority-high');
    }
}

function sortDocuments() {
    const container = document.getElementById('daycare-list');
    const items = Array.from(container.children); // Obtener todos los elementos hijos como un array

    // Ordenar los elementos basados en el color de sombra
    items.sort((a, b) => {
        const aPriority = getPriority(a.querySelector('.daycare-item'));
        const bPriority = getPriority(b.querySelector('.daycare-item'));
        return aPriority - bPriority; // Ordenar de menor a mayor prioridad
    });

    // Reorganizar los elementos en el contenedor
    items.forEach(item => container.appendChild(item)); // Mueve cada elemento al final del contenedor
}
function getPriority(button) {
    const boxShadow = getComputedStyle(button).boxShadow;
    
    if (boxShadow.includes('rgba(241, 2, 2')) { // Rojo
        return 1; // Prioridad alta
    } else if (boxShadow.includes('rgba(255, 145, 0')) { // Naranja
        return 2; // Prioridad media
    } else if (boxShadow.includes('rgba(0, 255, 0')) { // Verde
        return 3; // Prioridad baja
    }
    return 4; // Sin prioridad
}
function checkDatesAndUpdate() {
    const today = new Date().setHours(0, 0, 0); // La fecha de hoy sin horas

    document.querySelectorAll('.daycare-item').forEach(button => {
        const dateText = button.querySelector('.date-text');

        if (dateText) {
            const startDateText = dateText.innerHTML.split('Fecha de inicio: ')[1].split('<br>')[0];
            const endDateText = dateText.innerHTML.split('Fecha de término: ')[1];

            const startDate = convertToDate(startDateText);
            const endDate = convertToDate(endDateText);
            const daysRemaining = Math.max(0, Math.round((endDate - today) / (1000 * 60 * 60 * 24)));

            updateButtonStyles(button, daysRemaining);
        }
    });

    sortDocuments(); // Llamar a sortDocuments para reorganizar los documentos
}
