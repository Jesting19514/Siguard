function editName(button) {
    var daycareButton = button.previousElementSibling;
    var newName = prompt("Ingrese el nuevo nombre para la guardería:", daycareButton.textContent);
    if (newName) {
        daycareButton.textContent = newName;
    }
}

function addDaycare() {
    var daycareList = document.getElementById('daycare-list');
    var newDaycare = document.createElement('div');
    newDaycare.className = 'daycare-item-container';
    newDaycare.innerHTML = `
        <button class="daycare-item" onclick="location.href='daycare-details.php'">Guardería Nueva</button>
        <button class="edit-button" onclick="editName(this)">Editar</button>
        <button class="delete-button" onclick="deleteDaycare(this)">Borrar</button>
    `;
    daycareList.appendChild(newDaycare);
}

function deleteDaycare(button) {
    if (confirm("¿Está seguro de que desea eliminar esta guardería?")) {
        var daycareItem = button.parentElement;
        daycareItem.remove();
    }
}
