// Encapsular en una IIFE para evitar la contaminación del espacio global
(() => {
    let selectedButton = null;
    const disabledButtons = new Set();
    const modifiedButtons = new Set();

    // Inicializar botones al cargar la página
    window.onload = () => {
        document.querySelectorAll('.daycare-item').forEach(initButtonState);
    };

    function initButtonState(button) {
        button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)';
    }

    // Abrir el modal para seleccionar fechas
    window.openDatePicker = function(button) {
        const associatedButton = button.previousElementSibling;
        const checkbox = button.nextElementSibling;

        if (checkbox.checked && isInGrayState(associatedButton) && !modifiedButtons.has(associatedButton)) {
            selectedButton = associatedButton;
            document.getElementById('date-modal').style.display = 'flex';
        } else {
            alert('Solo puedes modificar la fecha si el estado está en gris y el checkbox está marcado, y si no se ha modificado antes.');
        }
    };

    // Cerrar el modal
    window.closeModal = function() {
        document.getElementById('date-modal').style.display = 'none';
    };

    // Formatear las fechas a DD/MM/YY
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = String(date.getFullYear()).slice(-2);
        return `${day}/${month}/${year}`;
    }

    // Guardar las fechas y actualizar la UI
    window.saveDates = function() {
        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;

        if (startDate && endDate && new Date(startDate) <= new Date(endDate)) {
            const formattedStartDate = formatDate(startDate);
            const formattedEndDate = formatDate(endDate);
            const buttonContent = selectedButton.textContent.split('Fecha de inicio')[0].trim();

            selectedButton.innerHTML = `${buttonContent}<br><span class="date-text">Fecha de inicio: ${formattedStartDate}<br>Fecha de término: ${formattedEndDate}</span>`;
            closeModal();

            modifiedButtons.add(selectedButton);
            const checkbox = selectedButton.nextElementSibling.nextElementSibling;

            if (checkbox.checked) {
                checkbox.checked = false;
                toggleCheckbox(checkbox);
            }

            checkDatesAndUpdate();
            resumeAlarms(selectedButton);
        } else {
            alert('Por favor, selecciona ambas fechas y asegúrate de que la fecha inicial no sea posterior a la fecha final.');
        }
    };

    // Cambiar el estado del checkbox
    window.toggleCheckbox = function(checkbox) {
        const button = checkbox.previousElementSibling.previousElementSibling;

        if (checkbox.checked) {
            button.style.boxShadow = '0 5px 5px rgba(128, 128, 128, 0.692)';
            disabledButtons.add(button);
            stopAlarms(button);
        } else {
            disabledButtons.delete(button);
            checkDatesAndUpdate();
        }
    };

    function stopAlarms(button) {
        console.log(`Alarmas detenidas para el botón: ${button.textContent}`);
    }

    function resumeAlarms(button) {
        console.log(`Alarmas reanudadas para el botón: ${button.textContent}`);
    }

    function isInGrayState(button) {
        return button.style.boxShadow.includes('rgba(128, 128, 128');
    }

    function convertToDate(dateString) {
        const [day, month, year] = dateString.split('/').map(Number);
        return new Date(`20${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`);
    }

    // Actualizar los colores de los botones según las fechas
    function checkDatesAndUpdate() {
        const today = new Date().setHours(0, 0, 0, 0);

        document.querySelectorAll('.daycare-item').forEach(button => {
            const dateText = button.querySelector('.date-text');
            const checkbox = button.nextElementSibling.nextElementSibling;

            if (dateText && !checkbox.checked) {
                const startDateText = dateText.innerHTML.split('Fecha de inicio: ')[1].split('<br>')[0];
                const endDateText = dateText.innerHTML.split('Fecha de término: ')[1];

                const startDate = convertToDate(startDateText);
                const endDate = convertToDate(endDateText);

                const totalDays = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24));
                const daysRemaining = Math.max(0, Math.round((endDate - today) / (1000 * 60 * 60 * 24)));

                if (daysRemaining <= 14) {
                    button.style.boxShadow = '0 5px 5px rgba(241, 2, 2, 0.692)'; // Rojo
                    estado=3;
                } else if (daysRemaining > totalDays / 2) {
                    button.style.boxShadow = '0 5px 5px rgba(0, 255, 0, 0.692)'; // Verde
                    estado=1;
                } else {
                    button.style.boxShadow = '0 5px 5px rgba(255, 145, 0, 0.692)'; // Naranja
                    estado=2;
                }
            }
        });
    }

})();
