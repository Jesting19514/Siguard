const btnLogin = document.getElementById("btnLogin");
const muestraToken = document.getElementById("token");
const btntokenDelete = document.getElementById("token2");
const btnPruebas = document.getElementById("btnPruebas");

btnLogin.addEventListener("click", async (event) => {
  event.preventDefault(); // Evita que el formulario recargue la página
  const usernameField = document.getElementById("usernameForm");
  const passwordField = document.getElementById("passwordForm");

  // Hacer la petición
  const res = await window.authentication.login(
    usernameField.value,
    passwordField.value
  );
  if (res) {
    alert(`${res}`);
    usernameField.value = "";
    passwordField.value = "";
  }
});
//Mostrar Token
muestraToken.addEventListener("click", async () => {
  alert(await window.authentication.obtenToken());
});
//Eliminar token
btntokenDelete.addEventListener("click", () => {
  try {
    window.authentication.borraSesion();
    alert("Token Eliminado ");
  } catch (error) {
    alert("Token No se elimino " + error.message);
  }
});
//------------Pruebas---------
//Ejemplo Agregar guarderia, es necesario seleccionar el id del gerente
btnPruebas.addEventListener("click", async () => {
  try {
    const res = await window.guarderia.add(
      "4",
      "Guarderia prueba 25",
      8,
      "2024-12-01",
      "2024-12-05"
    );
    alert(JSON.stringify(res));
  } catch (error) {
    alert("todo mal");
  }
});
