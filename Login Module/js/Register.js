document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const errorBox = document.getElementById("registerErrorMsg");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    errorBox.textContent = "";

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(res => res.json())
      .then(response => {
        if (response.success) {
          window.location.href = "/login";
        } else {
          errorBox.textContent = response.error || "Registration failed.";
        }
      })
      .catch(() => {
        errorBox.textContent = "Something went wrong. Please try again.";
      });
  });
});