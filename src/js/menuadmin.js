function editName(button) {
    var daycareButton = button.previousElementSibling;
    var newName = prompt("Ingrese el nuevo nombre para la guardería:", daycareButton.textContent);
    if (newName) {
        daycareButton.textContent = newName;
    }
}

function addDaycare() {
    var daycareName = prompt("Ingrese el nombre de la nueva guardería:");
    if (daycareName) {
        var daycareList = document.getElementById('daycare-list');
        var newDaycare = document.createElement('div');
        newDaycare.className = 'daycare-item-container';
        newDaycare.innerHTML = `
            <button class="daycare-item" onclick="location.href='daycare-details.php'">${daycareName}</button>
            <button class="edit-button" onclick="editName(this)"><img src="../src/assets/images/edit_icon.png" class="icon"></button>
            <button class="delete-button" onclick="deleteDaycare(this)"><img src="../src/assets/images/delete_icon.png" class="icon"></button>
        `;
        daycareList.appendChild(newDaycare);
    } else {
        alert("Debe ingresar un nombre para la guardería.");
    }
}


function deleteDaycare(button) {
    if (confirm("¿Está seguro de que desea eliminar esta guardería?")) {
        var daycareItem = button.parentElement;
        daycareItem.remove();
    }
}
// Seleccionar el botón y el contenedor del menú -----------Ruben_Prueba-----------------
const toggleButton = document.getElementById('toggle-doc');
const daycareItemContainer = toggleButton.closest('.daycare-item-container');

// Añadir un evento de click para activar/desactivar la clase "active"
toggleButton.addEventListener('click', function() {
    daycareItemContainer.classList.toggle('active');
});
// -----------------Ruben_Prueba-----------------------
function toggleDaycareContent(button) {
    // Alternar la clase 'expanded' para cambiar el tamaño del botón
    button.classList.toggle("expanded");

    // Verificar si el texto adicional ya existe
    var extraText = button.querySelector(".extra-text");

    if (button.classList.contains("expanded")) {
        // Si el botón se expandió y el texto no existe, lo añadimos
        if (!extraText) {
            var text = document.createElement("span");
            text.classList.add("extra-text");
            text.textContent = "Hola Mundo";
            button.appendChild(text);
        }
    } else {
        // Si se colapsa, removemos el texto adicional
        if (extraText) {
            extraText.remove();
        }
    }
}

// Funciones de ejemplo para los botones de editar y eliminar
function editName(button) {
    alert("Editar guardería");
}

function deleteDaycare(button) {
    alert("Eliminar guardería");
}