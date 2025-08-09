let generatedOTP = "";

document.getElementById("Makerandomotp").addEventListener("click", function () {
  const identifier = document.getElementById("identifier").value.trim();

  if (!identifier) {
    document.getElementById("errorMsg").textContent = "⚠ Please enter your email or mobile number.";
    return;
  }

  fetch("/Email-Identifier", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifier })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      OTPmmaker(identifier);
    } else {
      document.getElementById("errorMsg").textContent = data.message || "❌ Error Email/Cellphone number Not Registered.";
    }
  });
});

function OTPmmaker(identifier) {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();

  document.getElementById("Makerandomotp").style.display = "none";
  document.getElementById("ResendOtp").classList.remove("hidden");
  document.getElementById("errorMsg").textContent = "";
  document.getElementById("OtpMsg").textContent = "🔄 OTP has been resent!\n(Testing OTP: " + generatedOTP + ")";
}

document.getElementById("ResendOtp").addEventListener("click", function () {
  generatedOTP = Math.floor(100000 + Math.random() * 900000).toString();
  document.getElementById("OtpMsg").textContent = "🔄 OTP has been resent!\n(Testing OTP: " + generatedOTP + ")";
  document.getElementById("errorMsg").textContent = "";
});

document.getElementById("checkOtpBtn").addEventListener("click", function () {
  const enteredOTP = document.getElementById("otpInput").value.trim();

  if (enteredOTP === "") {
    document.getElementById("errorOtpMsg").textContent = "❌ Send OTP. Please try again.";
    document.getElementById("successMsg").textContent = "";
  } else if (enteredOTP === generatedOTP) {
    handleSuccessfulOTP();
  } else {
    document.getElementById("errorOtpMsg").textContent = "❌ Incorrect OTP. Please try again.";
    document.getElementById("successMsg").textContent = "";
  }
});

function handleSuccessfulOTP() {
  document.getElementById("errorOtpMsg").classList.add("hidden");
  document.getElementById("OtpMsg").classList.add("hidden");

  document.getElementById("passwordField").classList.remove("hidden");
  document.getElementById("repeatPasswordField").classList.remove("hidden");


  const changeBtn = document.getElementById("changeBtn");
  changeBtn.classList.remove("hidden");
  changeBtn.classList.add("active-button");

  document.getElementById("checkOtpBtn").style.display = "none";
  document.getElementById("Makerandomotp").style.display = "none";
  document.getElementById("ResendOtp").classList.add("hidden");

  document.getElementById("otpInput").setAttribute("readonly", true);

  document.getElementById("successMsg").textContent = "✅ OTP verified! You can now change your password.";
}


document.getElementById("changeBtn").addEventListener("click", function () {
  const pass1 = document.getElementById("newPassword").value;
  const pass2 = document.getElementById("repeatPassword").value;
  const identifier = document.getElementById("identifier").value.trim();
  const errorMsg = document.getElementById("errorMsg");

  const passwordRegex = /^(?=.*[0-9])(?=.*[\W_]).{8,15}$/;


  if (!pass1 || !pass2) {
    errorMsg.textContent = "⚠ Please fill in both password fields.";
    return;
  }

  if (pass1 !== pass2) {
    errorMsg.textContent = "❌ Passwords do not match.";
    return;
  }

  if (!passwordRegex.test(pass1)) {
    errorMsg.textContent = "❌ Password must be 8–15 characters, include at least one special character and one number.";
    return;
  }


  fetch("/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: identifier, new_password: pass1 })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      document.getElementById("successMsg").textContent = "✅ Password changed successfully!";
      errorMsg.textContent = "";
      window.location.href = "/login";
    } else {
      errorMsg.textContent = data.message || "❌ Error changing password.";
    }
  });
});