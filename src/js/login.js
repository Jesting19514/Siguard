const formLogin = document.getElementById("formLogin");
const btntoken = document.getElementById("token");
formLogin.addEventListener("submit", async (event) => {
  event.preventDefault(); // Evita que el formulario recargue la página
  const username = document.getElementById("usernameForm");
  const password = document.getElementById("passwordForm");

  const error = await window.authentication.login(
    username.value,
    password.value
  ); // Hacer la petición
  alert(`Credenciales Incorrectas ${JSON.stringify(error)}`);
});
btntoken.addEventListener("click", () => {
  const tokenguardado = window.authentication.obtenToken();
  alert(tokenguardado);
});
