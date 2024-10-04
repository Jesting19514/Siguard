let selectedButton = null; // Variable para almacenar el botón seleccionado
let disabledButtons = new Set(); // Conjunto para almacenar los botones que tienen la fecha desactivada
let modifiedButtons = new Set(); // Conjunto para almacenar botones que han sido modificados al menos una vez

// Inicializar el estado de los botones
document.querySelectorAll('.daycare-item').forEach(button => {
    button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)'; // Inicializar en estado gris
});

// Abrir el selector de fechas cuando se hace clic en el botón de edición
function openDatePicker(button) {
    const associatedButton = button.previousElementSibling; // Botón asociado al documento
    const checkbox = button.nextElementSibling; // Checkbox asociado

    // Solo permitir modificar si el checkbox está marcado y el estado es gris
    if (checkbox.checked && isInGrayState(associatedButton)) {
        // Verificar si ya se ha modificado antes
        const isModified = modifiedButtons.has(associatedButton);
        if (!isModified) {
            selectedButton = associatedButton; // Permitir modificar
            document.getElementById('date-modal').style.display = 'block'; // Mostrar el modal
        } else {
            alert('Este botón ya ha sido modificado, no puedes modificarlo nuevamente.');
        }
    } else {
        alert('Solo puedes modificar la fecha si el estado está en gris y el checkbox está marcado.');
    }
}

// Cerrar el modal
function closeModal() {
    document.getElementById('date-modal').style.display = 'none'; // Ocultar el modal
}

// Formatear las fechas
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2); // Solo dos dígitos del año
    return `${day}/${month}/${year}`;
}

// Guardar las fechas y actualizar los colores
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

        // Añadir el botón modificado al conjunto
        modifiedButtons.add(selectedButton);
        
        // Reactivar el botón si estaba desactivado
        const checkbox = selectedButton.nextElementSibling.nextElementSibling; // Seleccionar la casilla de verificación
        if (checkbox.checked) {
            checkbox.checked = false; // Desmarcar la casilla
            toggleCheckbox(checkbox); // Reactivar el contador y colores
        }

        // Verificar fechas y actualizar los colores
        checkDatesAndUpdate(); // Actualizar los colores según las fechas

        // Reanudar las alarmas si estaban detenidas
        resumeAlarms(selectedButton);
    } else {
        alert('Por favor, selecciona ambas fechas.');
    }
}

// Manejar el checkbox
function toggleCheckbox(checkbox) {
    const button = checkbox.previousElementSibling.previousElementSibling; // El botón asociado al checkbox

    if (checkbox.checked) {
        // Si el checkbox está marcado, poner el color gris y permitir la edición
        button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)'; // Gris
        disabledButtons.add(button); // Añadir el botón al conjunto de botones deshabilitados
        stopAlarms(button); // Detener las alarmas cuando se marque el checkbox
    } else {
        // Si el checkbox está desmarcado, volver a activar el contador y verificar fechas
        disabledButtons.delete(button); // Eliminar del conjunto de botones deshabilitados
        checkDatesAndUpdate(); // Actualizar los colores según las fechas
    }
}

// Función para detener las alarmas (el contador) cuando el checkbox está marcado
function stopAlarms(button) {
    console.log(`Alarmas detenidas para el botón: ${button.textContent}`);
    // Aquí puedes agregar lógica para detener las alarmas reales
}

// Función para reanudar las alarmas
function resumeAlarms(button) {
    console.log(`Alarmas reanudadas para el botón: ${button.textContent}`);
    // Aquí puedes agregar lógica para reanudar las alarmas reales
}

// Función para verificar si el botón está en estado gris
function isInGrayState(button) {
    return button.style.boxShadow.includes('rgba(128, 128, 128');
}

// Función para convertir la fecha
function convertToDate(dateString) {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(`20${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
}

// Verificar fechas y actualizar los colores según la fecha límite
function checkDatesAndUpdate() {
    const today = new Date().setHours(0, 0, 0, 0);

    document.querySelectorAll('.daycare-item').forEach(button => {
        const dateText = button.querySelector('.date-text');
        const checkbox = button.nextElementSibling.nextElementSibling; // Seleccionar la casilla de verificación

        if (dateText && !checkbox.checked) { // Solo verificar si el checkbox no está marcado
            const startDateText = dateText.innerHTML.split('Fecha de inicio: ')[1].split('<br>')[0];
            const endDateText = dateText.innerHTML.split('Fecha de término: ')[1];

            const startDate = convertToDate(startDateText);
            const endDate = convertToDate(endDateText);

            const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
            const daysRemaining = Math.max(0, Math.round((endDate - today) / (1000 * 60 * 60 * 24)));

            if (daysRemaining <= 14) {
                button.style.boxShadow = '0 5px 5px rgba(241, 2, 2, 0.692)'; // Rojo
            } else if (daysRemaining > totalDays / 2) {
                button.style.boxShadow = '0 5px 5px rgba(0, 255, 0, 0.692)'; // Verde
            } else {
                button.style.boxShadow = '0 5px 5px rgba(255, 145, 0, 0.692)'; // Naranja
            }
        }
    });
}

// Inicializar el estado de los botones al cargar la página
window.onload = function() {
    document.querySelectorAll('.daycare-item').forEach(button => {
        button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)'; // Inicializar en estado gris
    });
};
