document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const identifier = document.getElementById("identifier").value;
    const password = document.getElementById("password").value;

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        identifier: identifier,
        password: password
      })
    })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("ErrEmailMsg").textContent = "";
      document.getElementById("ErrPassMsg").textContent = "";

      if (data.success) {
        window.location.href = data.redirect;
      } else {
        if (data.error === "email") {
          document.getElementById("ErrEmailMsg").textContent = data.message;
        } else if (data.error === "password") {
          document.getElementById("ErrPassMsg").textContent = data.message;
        }
      }
    })
    .catch((error) => {
      console.error("Login failed:", error);
    });
  });
});