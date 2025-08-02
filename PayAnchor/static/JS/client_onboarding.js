document.addEventListener("DOMContentLoaded", function () {
  const nextButton = document.getElementById('nextBasic');
  const fullNameInput = document.getElementById('fullNameInput');
  const fullNameFeedback = document.getElementById('fullNameFeedback');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('password');
  const passwordFeedback = document.getElementById('passwordFeedback');

  // Password complexity function
  function isPasswordComplex(password) {
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    const minLength = password.length >= 8;
    return hasUpper && hasLower && hasDigit && hasSpecial && minLength;
  }

  // Validate basic info to enable/disable Next button
  function validateBasicInfo() {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    let isValid = true;

    // Full name validation
    if (fullName.length < 5 || fullName.length > 100 || !/^[A-Za-z\s]+$/.test(fullName)) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name must be 5-100 letters only.';
      isValid = false;
    } else {
      fullNameInput.classList.remove('is-invalid');
      fullNameFeedback.textContent = '';
    }

    // Email validation
    if (!emailPattern.test(email)) {
      emailInput.classList.add('is-invalid');
      isValid = false;
    } else {
      emailInput.classList.remove('is-invalid');
    }

    // Password complexity validation
    if (!isPasswordComplex(password)) {
      passwordInput.classList.add('is-invalid');
      passwordFeedback.textContent = 'Password must be 8+ chars, include uppercase, lowercase, number & special char.';
      isValid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordFeedback.textContent = '';
    }

    nextButton.disabled = !isValid;
  }

  // Full name input event + async validation
  fullNameInput.addEventListener('input', function () {
    const fullName = fullNameInput.value.trim();

    if (fullName.length === 0) {
      fullNameInput.classList.remove('is-invalid');
      nextButton.disabled = true;
      return;
    }

    if (fullName.length < 5) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name must be at least 5 characters.';
      nextButton.disabled = true;
      return;
    }

    if (fullName.length > 100) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name must be 100 characters or less.';
      nextButton.disabled = true;
      return;
    }

    // Async validation for allowed chars (letters + spaces)
    fetch(`/check-fullname/?name=${encodeURIComponent(fullName)}`)
      .then(response => response.json())
      .then(data => {
        if (!data.valid) {
          fullNameInput.classList.add('is-invalid');
          fullNameFeedback.textContent = 'Only letters and spaces are allowed.';
          nextButton.disabled = true;
        } else {
          fullNameInput.classList.remove('is-invalid');
          fullNameFeedback.textContent = '';
          validateBasicInfo();
        }
      })
      .catch(error => {
        console.error('Error checking name:', error);
        nextButton.disabled = false; // fail open
      });
  });

  // Email input event + async validation
  emailInput.addEventListener('input', function () {
    const email = emailInput.value.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (email.length > 5 && emailPattern.test(email)) {
      fetch(`/check-email/?email=${encodeURIComponent(email)}`)
        .then(response => response.json())
        .then(data => {
          if (data.exists) {
            emailInput.classList.add('is-invalid');
            emailInput.nextElementSibling.textContent = 'Email is already registered.';
            nextButton.disabled = true;
          } else {
            emailInput.classList.remove('is-invalid');
            emailInput.nextElementSibling.textContent = '';
            validateBasicInfo();
          }
        })
        .catch(error => {
          console.error('Error checking email:', error);
          nextButton.disabled = false; // fail open
        });
    } else {
      emailInput.classList.remove('is-invalid');
      nextButton.disabled = true;
    }
  });

  // Password input event - live validation
  passwordInput.addEventListener('input', () => {
    validateBasicInfo();
  });

  // Tab navigation & validation for next / previous buttons
  document.querySelectorAll('.next-tab').forEach(button => {
    button.addEventListener('click', () => {
      const currentTab = button.closest('.tab-pane');
      const inputs = currentTab.querySelectorAll('input[required]');
      let isValid = true;

      // Re-run JS validation for password if on basic tab
      if (currentTab.id === "basic") {
        validateBasicInfo();
      }

      inputs.forEach(input => {
        if (!input.checkValidity()) {
          input.classList.add('is-invalid');
          isValid = false;
        } else {
          input.classList.remove('is-invalid');
        }
      });

      if (currentTab.id === "basic") {
        const password = currentTab.querySelector('input[name="password"]');
        const confirmPassword = currentTab.querySelector('input[name="confirm_password"]');
        if (password.value !== confirmPassword.value) {
          confirmPassword.classList.add('is-invalid');
          confirmPassword.nextElementSibling.textContent = "Passwords do not match.";
          isValid = false;
        } else {
          confirmPassword.classList.remove('is-invalid');
        }

        // Re-validate password complexity explicitly
        if (!isPasswordComplex(password.value)) {
          password.classList.add('is-invalid');
          passwordFeedback.textContent = 'Password must meet complexity rules.';
          isValid = false;
        } else {
          password.classList.remove('is-invalid');
        }
      }

      if (isValid) {
        const activeTab = document.querySelector('#onboardingTabs .nav-link.active');
        const nextTab = activeTab.closest('li').nextElementSibling;
        if (nextTab) {
          const nextBtn = nextTab.querySelector('button');
          nextBtn.disabled = false;
          new bootstrap.Tab(nextBtn).show();
        }
      }
    });
  });

  document.querySelectorAll('.prev-tab').forEach(button => {
    button.addEventListener('click', () => {
      const activeTab = document.querySelector('#onboardingTabs .nav-link.active');
      const prevTab = activeTab.closest('li').previousElementSibling;
      if (prevTab) {
        const prevBtn = prevTab.querySelector('button');
        prevBtn.disabled = false;
        new bootstrap.Tab(prevBtn).show();
      }
    });
  });

  // Remove invalid class on input change globally
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
    });
  });

  // Final form submission validation
  document.getElementById('onboardingForm').addEventListener('submit', function (e) {
    const lastTab = document.querySelector('.tab-pane.active');
    const inputs = lastTab.querySelectorAll('input[required]');
    let isValid = true;

    inputs.forEach(input => {
      if (!input.checkValidity()) {
        input.classList.add('is-invalid');
        isValid = false;
      } else {
        input.classList.remove('is-invalid');
      }
    });

    const password = document.querySelector('input[name="password"]');
    const confirmPassword = document.querySelector('input[name="confirm_password"]');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.classList.add('is-invalid');
      confirmPassword.nextElementSibling.textContent = "Passwords do not match.";
      isValid = false;
    }
    if (!isValid) {
      e.preventDefault();
      alert("Please fill all required fields correctly before submitting.");
    }
  });

  // Initialize disable state on page load
  nextButton.disabled = true;
});
