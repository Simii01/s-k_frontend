document.addEventListener("DOMContentLoaded", () => {
  const btnLogin = document.getElementById('btnLogin');

  btnLogin.addEventListener("click", login);

  async function login() {
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('password').value.trim();
      const rememberMe = document.getElementById('rememberMe').checked;

      if (!email || !password) {
          alert("Please fill in both email and password.");
          return;
      }

      try {
          const res = await fetch('http://127.0.0.1:3000/api/Login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                  email, 
                  password,
                  remember: rememberMe
              }),
              credentials: 'include'
          });

          const data = await res.json();

          if (res.ok) {
              localStorage.setItem("user", JSON.stringify(data.user));
              if (data.token) {
                  localStorage.setItem("token", data.token);
              }
              await lsRememberMe();

              alert("Sikeres bejelentkezés!");

              if (data.user.is_admin) {
                  window.location.href = './admin.html';
              } else {
                  window.location.href = './Home.html';
              }

          } else if (data.errors) {
              let errorMessage = '';
              for (let i = 0; i < data.errors.length; i++) {
                  errorMessage += `${data.errors[i].error}\n`;
              }
              alert(errorMessage);
          } else if (data.error) {
              alert(data.error);
          } else {
              alert('Ismeretlen hiba');
          }

      } catch (error) {
          console.error("Login error:", error);
          alert("Something went wrong. Please try again later.");
      }
  }


  const rmCheck = document.getElementById("rememberMe"),
        emailInput = document.getElementById("email");

  if (localStorage.checkbox && localStorage.checkbox !== "") {
      rmCheck.setAttribute("checked", "checked");
      emailInput.value = localStorage.username;
  } else {
      rmCheck.removeAttribute("checked");
      emailInput.value = "";
  }


  async function lsRememberMe() {
      if (rmCheck.checked && emailInput.value !== "") {
          localStorage.username = emailInput.value;
          localStorage.checkbox = rmCheck.value;
      } else {
          localStorage.username = "";
          localStorage.checkbox = "";
      }
  }
});
