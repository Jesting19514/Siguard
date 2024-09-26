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
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Solo dos dígitos del año
    return `${day}/${month}/${year}`;
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
    return true;
}

function saveDates() {
    const startDate = document.getElementById('start-date').value;
    const endDate = document.getElementById('end-date').value;

    if (startDate && endDate) {
        const formattedStartDate = formatDate(startDate);
        const formattedEndDate = formatDate(endDate);

        // Asegurarse de que el botón solo contenga el nombre, sin fechas previas
        const buttonContent = selectedButton.textContent.split('Fecha de inicio')[0].trim();

        // Actualizar el contenido del botón con el nombre del documento y las nuevas fechas
        selectedButton.innerHTML = `${buttonContent}<br><span class="date-text">Fecha de inicio: ${formattedStartDate}<br>Fecha de término: ${formattedEndDate}</span>`;
        
        closeModal(); // Ocultar el modal después de guardar las fechas

        // Verificar fechas
        checkDatesAndUpdate();
    } else {
        alert('Por favor, selecciona ambas fechas.');
    }
}


// Función que no hace nada cuando se hace clic en el botón del documento
function doNothing() {
    // No hace nada
}
function checkDatesAndUpdate() {
    const today = new Date();
    const twoWeeksInMillis = 14 * 24 * 60 * 60 * 1000; // Milisegundos en 2 semanas

    // Recorremos todos los botones para verificar las fechas
    document.querySelectorAll('.daycare-item').forEach(button => {
        const dateText = button.querySelector('.date-text');
        if (dateText) {
            const endDateText = dateText.innerHTML.split('Fecha de término: ')[1];
            const endDate = new Date(endDateText.split('<br>')[0]);

            // Calcular la diferencia entre la fecha actual y la fecha final
            const timeDifference = endDate - today;

            // Aquí podrías añadir lógica adicional si necesitas alertar al usuario u otra acción
            if (timeDifference <= twoWeeksInMillis && timeDifference > 0) {
                console.log("Faltan menos de dos semanas para la fecha final.");
            }
        }
    });
}