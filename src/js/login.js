const btnLogin = document.getElementById("btnLogin");
const muestraToken = document.getElementById("token");
const btntokenDelete = document.getElementById("token2");

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
