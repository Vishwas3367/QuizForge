const API_BASE =
  "https://ti3d0a29rd.execute-api.ap-south-1.amazonaws.com/dev";

// =============================
// SIMPLE AUTH SERVICE
// =============================

const Auth = {

async signUp({
  username,
  password,
  role,
  attributes
}) {

    const res = await fetch(
      `${API_BASE}/auth/register`,
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json"
        },
        body: JSON.stringify({
          name: attributes.name,
          email: username,
          phone: attributes.phone,
          password,
          role: role
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data.error ||
        "Registration failed"
      );
    }

    return data;
  },

async signIn(
  email,
  password,
  role
) {

  const res = await fetch(
    `${API_BASE}/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type":
          "application/json"
      },
      body: JSON.stringify({
        email,
        password,
        role
      })
    }
  );

  const data =
    await res.json();

  if (!res.ok) {

    throw new Error(
      data.error ||
      "Invalid credentials"
    );
  }

  return {
  accessToken:
    data.accessToken,

  idToken:
    data.idToken,

  refreshToken:
    data.refreshToken,

  email:
    email,

  role:
    role
};
}
};

// =============================
// ELEMENTS
// =============================

const teacherLoginBtn =
  document.getElementById(
    "teacher-login"
  );

const studentLoginBtn =
  document.getElementById(
    "student-login"
  );

const studentGuestBtn =
  document.getElementById(
    "student-guest"
  );

const signupBtn =
  document.getElementById(
    "signup-btn"
  );

const openQuizBtn =
  document.getElementById(
    "open-quiz"
  );

const teacherEmail =
  document.getElementById(
    "teacher-email"
  );

const teacherPass =
  document.getElementById(
    "teacher-pass"
  );

const studentEmail =
  document.getElementById(
    "student-email"
  );

const studentPass =
  document.getElementById(
    "student-pass"
  );

const signupName =
  document.getElementById(
    "signup-name"
  );

const signupEmail =
  document.getElementById(
    "signup-email"
  );

const signupPass =
  document.getElementById(
    "signup-pass"
  );

const signupRole =
  document.getElementById(
    "signup-role"
  );

const quizLink =
  document.getElementById(
    "quiz-link"
  );

const teacherMsg =
  document.getElementById(
    "teacher-msg"
  );

const studentMsg =
  document.getElementById(
    "student-msg"
  );

const signupMsg =
  document.getElementById(
    "signup-msg"
  );

const linkMsg =
  document.getElementById(
    "link-msg"
  );
document
.getElementById("teacher-forgot-btn")
?.addEventListener("click", () => {

  document
    .getElementById("forgotModal")
    .style.display = "flex";

});

document
.getElementById("sendResetBtn")
?.addEventListener("click", async () => {

  const email =
    document
      .getElementById("forgotEmail")
      .value
      .trim();
    console.log("EMAIL:", email);

  if (!email) {

    alert("Enter email");

    return;
  }

  try {

    const res =
      await fetch(
        `${API_BASE}/auth/forgot`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            email
          })
        }
      );

    const data =
      await res.json();

   alert(
     "OTP sent successfully. Check your email."
   );

  } catch (err) {

    alert(
      err.message
    );
  }
});

document
.getElementById("resetPasswordBtn")
?.addEventListener("click", async () => {

  const email =
    document.getElementById("forgotEmail").value.trim();

  const otp =
    document.getElementById("forgotOtp").value.trim();

  const password =
    document.getElementById("forgotPassword").value.trim();

  try {

    const res = await fetch(
      `${API_BASE}/auth/reset`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          otp,
          password
        })
      }
    );

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    alert("Password reset successfully");

  } catch (err) {

    alert(err.message);

  }

});


document
.getElementById("student-forgot-btn")
?.addEventListener("click", async () => {

  document
    .getElementById(
      "teacher-forgot-btn"
    )
    .click();
});


// =============================
// HELPERS
// =============================

function showMessage(
  element,
  message,
  success = true
) {

  if (!element) return;

  element.style.color =
    success
      ? "green"
      : "crimson";

  element.textContent =
    message;
}

function extractQuizId(
  input
) {

  if (!input) return null;

  input = input.trim();

  try {

    const url =
      new URL(input);

    const id =
      url.searchParams.get("id");

    if (id) {
      return id;
    }

  } catch (err) {}

  // Direct Quiz ID
  if (
    /^[a-f0-9-]{20,}$/i.test(
      input
    )
  ) {

    return input;
  }

  return null;
}

// =============================
// SIGNUP
// =============================

if (signupBtn) {
  signupBtn.onclick = async () => {

    try {

      showMessage(
        signupMsg,
        "Creating account..."
      );

      const name =
        signupName.value.trim();

      const email =
        signupEmail.value.trim();

      const password =
        signupPass.value.trim();
      const phone =
        document.getElementById("signup-phone").value.trim();

      if (
        !name ||
        !email ||
        !phone ||
        !password
      ) {
        throw new Error(
          "Please fill all fields"
        );
      }

      const role =
      signupRole.value;

    await Auth.signUp({
      username: email,
      password,
      role,
      attributes: {
      email,
      name,
      phone
      } 
    });

      window.pendingEmail =
email;

document
.getElementById("otpModal")
.classList.add("show");


    } catch (err) {

      console.error(err);

      showMessage(
        signupMsg,
        err.message ||
        "Signup failed",
        false
      );
    }
  };
}

// =============================
// TEACHER LOGIN
// =============================

teacherLoginBtn.onclick =
  async () => {

    try {

      showMessage(
        teacherMsg,
        "Signing in..."
      );

      const email =
        teacherEmail.value.trim();

      const password =
        teacherPass.value.trim();

      const data =
        await Auth.signIn(
          email,
          password,
          "teacher"
        );

      localStorage.setItem(
        "quiz_access_token",
        data.accessToken
      );

      localStorage.setItem(
        "quiz_user_role",
        data.role
      );

      localStorage.setItem(
        "quiz_user_email",
        data.email
      );

      showMessage(
        teacherMsg,
        "Teacher login successful"
      );

      setTimeout(() => {

        window.location.href =
          "teacher.html";

      }, 1000);

    } catch (err) {

      showMessage(
        teacherMsg,
        err.message ||
        "Login failed",
        false
      );
    }
  };

// =============================
// STUDENT LOGIN
// =============================

studentLoginBtn.onclick =
  async () => {

    try {

      showMessage(
        studentMsg,
        "Signing in..."
      );

      const email =
        studentEmail.value.trim();

      const password =
        studentPass.value.trim();

      const data =
        await Auth.signIn(
          email,
          password,
          "student"
        );

      localStorage.setItem(
        "quiz_access_token",
        data.accessToken
      );

      localStorage.setItem(
        "quiz_user_role",
        data.role
      );

      localStorage.setItem(
        "quiz_user_email",
        data.email
      );

      showMessage(
        studentMsg,
        "Student login successful"
      );

      setTimeout(() => {

        window.location.href =
          "student.html";

      }, 1000);

    } catch (err) {

      showMessage(
        studentMsg,
        err.message ||
        "Login failed",
        false
      );
    }
  };

// =============================
// QUIZ LINK
// =============================

openQuizBtn.onclick =
  () => {

    const quizId =
      extractQuizId(
        quizLink.value
      );

    if (!quizId) {

      showMessage(
        linkMsg,
        "Invalid quiz link or quiz ID",
        false
      );

      return;
    }

    window.location.href =
      `quiz.html?id=${encodeURIComponent(
        quizId
      )}`;
  };
document
.getElementById("closeForgot")
?.addEventListener("click", () => {

  document
    .getElementById("forgotModal")
    .style.display = "none";

});
document
.getElementById("closeOtp")
?.addEventListener("click", () => {

  document
    .getElementById("otpModal")
    .classList.remove("show");

  document
    .getElementById("signupModal")
    .style.display = "none";

  window.pendingEmail = null;
});
document
.getElementById("verifyOtpBtn")
?.addEventListener(
"click",
async()=>{

  const code =
  document
  .getElementById("otpCode")
  .value
  .trim();

  try{

    const res =
    await fetch(
      `${API_BASE}/auth/confirm`,
      {
        method:"POST",
        headers:{
          "Content-Type":
          "application/json"
        },
        body:JSON.stringify({
          email:
          window.pendingEmail,
          code
        })
      }
    );

    const data =
    await res.json();

    if(!res.ok){

      throw new Error(
        data.error
      );
    }
document
.getElementById("signupModal")
.style.display = "none";

document
.getElementById("otpModal")
.classList.remove("show");

document
.getElementById("signupModal")
.style.display = "none";

// document
// .getElementById("closeOtp")
// ?.addEventListener("click", () => {

//   document
//     .getElementById("otpModal")
//     .classList.add("hidden");

//   document
//     .getElementById("signupModal")
//     .style.display = "flex";

// });
showMessage(
  signupMsg,
  "Account verified successfully!"
);

signupName.value = "";
signupEmail.value = "";
document.getElementById("signup-phone").value = "";
signupPass.value = "";

setTimeout(() => {

document
.querySelector(".login-card")
  ?.scrollIntoView({
    behavior:"smooth"
  });

},1000);

  }catch(err){

    alert(
      err.message
    );
  }
});