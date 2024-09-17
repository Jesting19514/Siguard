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
            <button class="edit-button" onclick="editName(this)"><img src="../../assets/images/edit_icon.png" class="icon"></button>
            <button class="delete-button" onclick="deleteDaycare(this)"><img src="../../assets/images/delete_icon.png" class="icon"></button>
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
