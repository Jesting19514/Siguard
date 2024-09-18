let currentButton = null;

        // Abrir el modal y guardar el botón clicado
        function openModal(button) {
            currentButton = button;
            document.getElementById("myModal").style.display = "flex";
        }

        // Cerrar el modal
        function closeModal() {
            document.getElementById("myModal").style.display = "none";
        }

        // Validar las fechas y guardar las válidas
        function saveDates() {
            const startDateInput = document.getElementById("start-date").value;
            const endDateInput = document.getElementById("end-date").value;
            const today = new Date().toISOString().split('T')[0];

            const startDate = new Date(startDateInput);
            const endDate = new Date(endDateInput);

            // Validación de fechas
            if (!startDateInput || !endDateInput) {
                alert("Por favor, seleccione ambas fechas.");
                return;
            }

            if (startDateInput < today) {
                alert("La fecha de inicio no puede ser una fecha pasada.");
                return;
            }

            if (endDateInput < today) {
                alert("La fecha final no puede ser una fecha pasada.");
                return;
            }

            if (endDate < startDate) {
                alert("La fecha final debe ser después de la fecha de inicio.");
                return;
            }

            if (currentButton) {
                let dateDisplay = currentButton.querySelector(".date-display");
                if (!dateDisplay) {
                    dateDisplay = document.createElement("div");
                    dateDisplay.className = "date-display";
                    currentButton.appendChild(dateDisplay);
                }
                dateDisplay.textContent = `Fecha de inicio: ${startDateInput}, Fecha final: ${endDateInput}`;
            }

            closeModal();
        }

        // Añadir un nuevo botón al contenido
        function addButton() {
            const content = document.getElementById("content");

            const newButtonWrapper = document.createElement('div');
            newButtonWrapper.className = 'daycare-item-wrapper';

            const statusCircle = document.createElement('div');
            statusCircle.className = 'status-circle green'; // Puedes ajustar el color aquí
            newButtonWrapper.appendChild(statusCircle);

            const newButton = document.createElement('button');
            newButton.className = 'daycare-item';
            newButton.onclick = function() { openModal(newButton); };
            const nameSpan = document.createElement('span');
            nameSpan.className = 'name';
            nameSpan.textContent = 'Anexo ---';
            newButton.appendChild(nameSpan);
            
            const dateDisplay = document.createElement('div');
            dateDisplay.className = 'date-display';
            newButton.appendChild(dateDisplay);

            const editButton = document.createElement('button');
            editButton.className = 'edit-btn';
            editButton.onclick = function() { editName(editButton); };
            editButton.textContent = 'Editar Nombre';

            newButtonWrapper.appendChild(newButton);
            newButtonWrapper.appendChild(editButton);
            content.appendChild(newButtonWrapper);
        }

        // Función para editar el nombre del botón
        function editName(button) {
            const buttonWrapper = button.parentElement;
            const nameSpan = buttonWrapper.querySelector('.name');
            
            // Crear elementos para editar el nombre
            let input = buttonWrapper.querySelector('.edit-input');
            let saveButton = buttonWrapper.querySelector('.save-btn');

            if (!input) {
                input = document.createElement('input');
                input.type = 'text';
                input.className = 'edit-input';
                input.value = nameSpan.textContent.trim();
                buttonWrapper.insertBefore(input, button.nextSibling);
            }

            if (!saveButton) {
                saveButton = document.createElement('button');
                saveButton.className = 'save-btn';
                saveButton.textContent = 'Guardar';
                saveButton.onclick = function() { saveName(saveButton); };
                buttonWrapper.insertBefore(saveButton, button.nextSibling);
            }

            // Mostrar el input y el botón de guardar
            input.style.display = 'inline-block';
            saveButton.style.display = 'inline-block';
        }

        // Guardar el nuevo nombre del botón sin borrar la fecha
        function saveName(button) {
            const buttonWrapper = button.parentElement;
            const input = buttonWrapper.querySelector('.edit-input');
            const nameSpan = buttonWrapper.querySelector('.name');

            if (input.value.trim()) {
                nameSpan.textContent = input.value.trim();
            }

            // Limpiar el input y ocultar el botón de guardar
            input.style.display = 'none';
            button.style.display = 'none';
        }
        window.addEventListener('scroll', function() {
            const content = document.querySelector('.content');
            const floatingBtn = document.querySelector('.floating-btn');
            
            // Obtén las posiciones del contenido y el botón
            const contentRect = content.getBoundingClientRect();
            const btnHeight = floatingBtn.offsetHeight;
        
            // Verifica si la parte inferior del contenido está visible en la pantalla
            if (contentRect.bottom <= window.innerHeight) {
                // Ancla el botón al final del contenido si se ha alcanzado
                floatingBtn.style.position = 'absolute';
                floatingBtn.style.bottom = '0'; // Mueve el botón al final del contenido
                floatingBtn.style.right = '20px';
            } else {
                // Mantén el botón flotante en su posición fija si no está al final
                floatingBtn.style.position = 'fixed';
                floatingBtn.style.bottom = '20px'; // Vuelve a la parte inferior de la pantalla
                floatingBtn.style.right = '20px';
            }
        });
        function addButton() {
            const content = document.getElementById('content');
            
            // Crear un nuevo contenedor para el anexo
            const newItemWrapper = document.createElement('div');
            newItemWrapper.className = 'daycare-item-wrapper';
            
            // Crear el círculo de estado
            const statusCircle = document.createElement('div');
            statusCircle.className = 'status-circle green'; // Cambia el color si es necesario
            newItemWrapper.appendChild(statusCircle);
            
            // Crear el botón del anexo
            const daycareItem = document.createElement('button');
            daycareItem.className = 'daycare-item';
            daycareItem.onclick = function() { openModal(this); };
            daycareItem.innerHTML = '<span class="name">Anexo Nuevo</span><div class="date-display"></div>';
            newItemWrapper.appendChild(daycareItem);
            
            // Crear el botón de edición
            const editBtn = document.createElement('button');
            editBtn.className = 'edit-btn';
            editBtn.onclick = function() { editName(this); };
            editBtn.textContent = 'Editar Nombre';
            newItemWrapper.appendChild(editBtn);
            
            // Crear el botón de eliminación
            const deleteBtn = document.createElement('div');
            deleteBtn.className = 'delete-btn';
            deleteBtn.onclick = function() { deleteAnexo(this); };
            newItemWrapper.appendChild(deleteBtn);
            
            // Añadir el nuevo anexo al contenido
            content.insertBefore(newItemWrapper, content.querySelector('.floating-btn'));
        }
        
        function deleteAnexo(element) {
            // Confirmar si el usuario realmente quiere eliminar el anexo
            const confirmation = confirm('¿Estás seguro de que deseas eliminar este anexo?');
            if (confirmation) {
                const wrapper = element.closest('.daycare-item-wrapper');
                wrapper.remove(); // Elimina el anexo completo
            }
        }
        