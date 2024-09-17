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
        <img src="../src/img/editb.png" class="iconedit" onclick="editName(this)" alt="Editar">
        <img src="../src/img/contract_delete_24dp_00000_FILL0_wght400_GRAD0_opsz24.png" class="icondelete" onclick="deleteDaycare(this)" alt="Borrar">
    `;
    daycareList.appendChild(newDaycare);
}

function deleteDaycare(button) {
    if (confirm("¿Está seguro de que desea eliminar esta guardería?")) {
        var daycareItem = button.parentElement;
        daycareItem.remove();
    }
}
