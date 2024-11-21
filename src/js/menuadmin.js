let currentAction = null;
let currentButton = null;

function showModal(action, button) {
  currentAction = action;
  currentButton = button;
  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modal-title");
  const modalInput = document.getElementById("modal-input");
  const numGuarderiaInput = document.getElementById("num-guarderia");
  const startDateInput = document.getElementById("start-date"); // Campo para fecha de inicio
  const endDateInput = document.getElementById("end-date"); // Campo para fecha de término
  const deleteModal = document.getElementById("delete-confirm-modal");

  if (action === "add") {
    modalTitle.textContent = "Agregar Guardería";
    modalInput.value = "";
    modalInput.placeholder = "Ingrese el nombre de la guardería";
    numGuarderiaInput.value = ""; // Limpia el campo del número de guardería
    numGuarderiaInput.placeholder = "Ingrese el Número de Guardería"; // Establece el placeholder
    startDateInput.value = ""; // Limpia el campo de fecha de inicio
    endDateInput.value = ""; // Limpia el campo de fecha de término
    modal.style.display = "block";
    setTimeout(() => modalInput.focus(), 100);
  } else if (action === "edit") {
    modalTitle.textContent = "Editar Nombre de Guardería";
    const currentRazonSocial = button.previousElementSibling.textContent; // Obtiene el nombre actual
    const currentNumGuarderia = button.getAttribute("data-num-guarderia"); // Obtén el número de guardería actual
    const currentStartDate = button.getAttribute("data-start-date"); // Obtén la fecha de inicio actual
    const currentEndDate = button.getAttribute("data-end-date"); // Obtén la fecha de término actual

    // Llena los campos del modal con la información actual
    modalInput.value = currentRazonSocial; // Razon social
    numGuarderiaInput.value = currentNumGuarderia; // Número de guardería actual
    numGuarderiaInput.placeholder = ""; // Limpia el placeholder para la edición

    // Llena los campos de fecha
    startDateInput.value = currentStartDate; // Fecha de inicio actual
    endDateInput.value = currentEndDate; // Fecha de término actual

    modal.style.display = "block";
    setTimeout(() => modalInput.focus(), 100);
  } else if (action === "delete") {
    showDeleteConfirmModal();
    return;
  }
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.style.display = "none";
}

function closeDeleteConfirmModal() {
  const deleteModal = document.getElementById("delete-confirm-modal");
  deleteModal.style.display = "none";
}

async function editDaycare(button) {
  showModal("edit", button);

  const daycareContainer = button.closest(".daycare-item-container");
  const id = daycareContainer.getAttribute("data-id");
  const currentRazonSocial = button.previousElementSibling.textContent; // Nombre de la guardería
  const currentNumGuarderia = button.getAttribute("data-num-guarderia"); // Número de guardería actual
  const currentStartDate = button.getAttribute("data-start-date"); // Obtén la fecha de inicio actual
  const currentEndDate = button.getAttribute("data-end-date"); // Obtén la fecha de término actual

  // Llena los campos del modal con la información actual
  document.getElementById("modal-input").value = currentRazonSocial; // Nombre de la guardería
  document.getElementById("num-guarderia").value = currentNumGuarderia; // Número de la guardería actual
  document.getElementById("start-date").value = currentStartDate; // Fecha de inicio
  document.getElementById("end-date").value = currentEndDate; // Fecha de término

  document.getElementById("modal-confirm").onclick = async () => {
    const newName = document.getElementById("modal-input").value;
    const newNumGuarderia = document.getElementById("num-guarderia").value;
    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;

    if (newName && newNumGuarderia && startDate && endDate) {
      const messageContainer = document.createElement("div");
      messageContainer.textContent = "Espere un segundo...";
      messageContainer.style.color = "blue";
      messageContainer.style.marginTop = "10px";
      const modalContent = document.querySelector(".modal-content");
      modalContent.appendChild(messageContainer);

      try {
        const response = await fetch(
          `http://localhost:3000/api/daycares/${id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              razon_social: newName,
              fecha_inicio: startDate,
              fecha_termino: endDate,
              num_guarderia: newNumGuarderia,
            }),
          }
        );

        const result = await response.json();
        if (result.success) {
          closeModal();
          loadDaycares();
        } else {
          console.error("Error:", result.message);
        }
      } catch (error) {
        console.error("Error al actualizar la guardería:", error);
      } finally {
        setTimeout(() => {
          messageContainer.remove();
        }, 1000);
      }
    } else {
      alert("Por favor, completa todos los campos antes de confirmar.");
    }
  };
}

async function loadDaycares() {
  const daycareList = document.getElementById("daycare-list");
  daycareList.innerHTML = "";

  try {
    const daycares = await window.guarderia.getAll();
    //const daycares = await response.json();

    daycares.forEach((daycare) => {
      const daycareItemContainer = document.createElement("div");
      daycareItemContainer.classList.add("daycare-item-container");
      daycareItemContainer.setAttribute("data-id", daycare.id);

      // Crear el botón para la razón social
      const daycareButton = document.createElement("button");
      daycareButton.classList.add("daycare-item");
      daycareButton.textContent = daycare.nombreGuarderia;

      daycareButton.onclick = () => {
        const params = {
          idGuarderia: daycare.id,
          nombreGuarderia: daycare.nombreGuarderia,
          fechaInicioContrato: daycare.fechaInicioContrato,
          fechaFinContrato: daycare.fechaFinContrato,
        };
        window.navegation.navigate("adminguarCon.html", params);
      };

      // Crear el contenedor para el número de guardería
      const numGuarderiaContainer = document.createElement("div");
      numGuarderiaContainer.classList.add("num-guarderia-container");
      numGuarderiaContainer.textContent = daycare.id;

      // Botón de edición
      const editButton = document.createElement("button");
      editButton.classList.add("edit-button");
      editButton.onclick = () => editDaycare(editButton);
      editButton.setAttribute("data-num-guarderia", daycare.id); // Establecer el número de guardería
      editButton.setAttribute("data-start-date", daycare.fechaInicioContrato); // Establecer la fecha de inicio
      editButton.setAttribute("data-end-date", daycare.fechaFinContrato); // Establecer la fecha de término

      const editIcon = document.createElement("img");
      editIcon.src = "../../assets/images/editIcon_1.png";
      editIcon.classList.add("icon");
      editButton.appendChild(editIcon);

      // Botón de eliminación
      const deleteButton = document.createElement("button");
      deleteButton.classList.add("delete-button");
      deleteButton.onclick = () => deleteDaycare(deleteButton);
      const deleteIcon = document.createElement("img");
      deleteIcon.src = "../../assets/images/deleteIcon2.png";
      deleteIcon.classList.add("icon");
      deleteButton.appendChild(deleteIcon);

      // Agregar elementos al contenedor principal
      daycareItemContainer.appendChild(numGuarderiaContainer);
      daycareItemContainer.appendChild(daycareButton); // Botón de razón social
      daycareItemContainer.appendChild(editButton); // Botón de editar
      daycareItemContainer.appendChild(deleteButton); // Botón de eliminar

      daycareList.appendChild(daycareItemContainer);
    });
  } catch (error) {
    console.error("Error al cargar las guarderías:", error);
  }
}

document.addEventListener("DOMContentLoaded", loadDaycares);

function deleteDaycare(button) {
  currentButton = button;
  showModal("delete", button);
}

function showDeleteConfirmModal() {
  const deleteModal = document.getElementById("delete-confirm-modal");
  const confirmInput = document.getElementById("delete-confirm-input");
  const errorText = document.getElementById("delete-error");

  confirmInput.value = "";
  confirmInput.disabled = false;
  confirmInput.placeholder = "Escriba DELETE para confirmar";
  deleteModal.style.display = "block";

  errorText.style.display = "none";

  setTimeout(() => confirmInput.focus(), 100);
}

function confirmDelete() {
  const daycareContainer = currentButton.closest(".daycare-item-container");
  const id = daycareContainer.getAttribute("data-id");
  const confirmInput = document.getElementById("delete-confirm-input");
  const errorText = document.getElementById("delete-error");

  errorText.style.display = "none";

  if (confirmInput.value === "DELETE") {
    fetch(`http://localhost:3000/api/daycares/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          daycareContainer.remove();
          closeDeleteConfirmModal();
        } else {
          console.error("Error:", result.message);
        }
      })
      .catch((error) =>
        console.error("Error al eliminar la guardería:", error)
      );
  } else {
    errorText.textContent =
      "¡Confirmación incorrecta! Escriba DELETE para continuar.";
    errorText.style.display = "block";
  }
}
async function loadGerentes() {
  const selectGerentes = document.getElementById("gerentes-list");
  try {
    const listaGerentes = await window.usuario.listGerentes(); //Peticion a la API
    listaGerentes.forEach((gerente) => {
      const option = document.createElement("option"); // Crear un <option>
      option.value = gerente.idGerente; // Establecer el valor como idGerente
      option.textContent = gerente.nombre; // Establecer el texto como nombre
      selectGerentes.appendChild(option); // Añadir la opción al <select>
    });
  } catch (error) {
    console.log(error);
    const option = document.createElement("option");
    option.textContent = "Verifique su conexion a internet";
    selectGerentes.appendChild(option); // Añadir la opción al <select>
  }
}

async function addDaycare() {
  await loadGerentes(); //Carga los option para el select
  showModal("add");

  document.getElementById("modal-confirm").onclick = async () => {
    const newNumGuarderia = document.getElementById("num-guarderia").value;
    const newRazonSocial = document.getElementById("modal-input").value;
    const idGerente = document.getElementById("gerentes-list").value;

    const startDate = document.getElementById("start-date").value;
    const endDate = document.getElementById("end-date").value;
    if (
      newRazonSocial &&
      startDate &&
      endDate &&
      newNumGuarderia &&
      idGerente
    ) {
      const messageContainer = document.createElement("div");
      messageContainer.textContent = "Espere un segundo...";
      messageContainer.style.color = "blue";
      messageContainer.style.marginTop = "10px";
      const modalContent = document.querySelector(".modal-content");
      modalContent.appendChild(messageContainer);

      try {
        const result = await window.guarderia.add(
          newNumGuarderia,
          newRazonSocial,
          idGerente,
          startDate,
          endDate
        );

        if (result.status === 200) {
          closeModal();
          alert("Guarderia Agregada Exitosamente");
          await loadDaycares();
        } else {
          alert("Algo salio mal, vuelva a intentarlo :( \n");
          closeModal();
          console.error("Error:", result.message);
        }
      } catch (error) {
        alert("Algo salio mal :( \n" + error);
        closeModal();
      }
    } else {
      alert("Por favor, completa todos los campos antes de confirmar.");
    }
  };
}

function filterDaycares() {
  const searchTerm = document.getElementById("search-bar").value.toLowerCase();
  const daycareItems = document.querySelectorAll(".daycare-item-container");

  daycareItems.forEach((daycareItem) => {
    const name = daycareItem
      .querySelector(".daycare-item")
      .textContent.toLowerCase();
    const numGuarderia = daycareItem
      .querySelector(".num-guarderia-container")
      .textContent.toLowerCase(); // Obtener el número de guardería

    // Mostrar el elemento si coincide con el nombre o el número de guardería
    if (name.includes(searchTerm) || numGuarderia.includes(searchTerm)) {
      daycareItem.style.display = "flex"; // Mostrar el elemento si coincide con la búsqueda.
    } else {
      daycareItem.style.display = "none"; // Ocultar el elemento si no coincide.
    }
  });
}
