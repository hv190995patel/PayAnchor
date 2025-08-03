document.addEventListener("DOMContentLoaded", () => {
  const nextButton = document.getElementById('nextBasic');
  const fullNameInput = document.getElementById('fullNameInput');
  const fullNameFeedback = document.getElementById('fullNameFeedback');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('password');
  const passwordFeedback = document.getElementById('passwordFeedback');

  // ---------------------- Utilities ----------------------

  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const isPasswordComplex = (password) => {
    return (
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[^A-Za-z0-9]/.test(password) &&
      password.length >= 8
    );
  };

  const validateInputs = (inputs) => {
    let isValid = true;
    inputs.forEach((input) => {
      if (!input.checkValidity()) {
        input.classList.add('is-invalid');
        isValid = false;
      }
    });
    return isValid;
  };

  const validatePasswordMatch = () => {
    const confirmPassword = document.querySelector('input[name="confirm_password"]');
    if (!confirmPassword) return true;

    if (passwordInput.value !== confirmPassword.value) {
      confirmPassword.classList.add('is-invalid');
      const feedback = confirmPassword.nextElementSibling;
      if (feedback && feedback.classList.contains('invalid-feedback')) {
        feedback.textContent = "Passwords do not match.";
      }
      return false;
    } else {
      confirmPassword.classList.remove('is-invalid');
      return true;
    }
  };

  // ------------------ Main Basic Info Validation ------------------

  const validateBasicInfo = () => {
    const fullName = fullNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    let isValid = true;

    // Full Name validation
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
  };

  // ------------------ Async Validators ------------------

  const debouncedFullNameCheck = debounce((name) => {
    fetch(`/check-fullname/?name=${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(data => {
        if (!data.valid) {
          fullNameInput.classList.add('is-invalid');
          fullNameFeedback.textContent = 'Name is not allowed.';
          nextButton.disabled = true;
        } else {
          fullNameInput.classList.remove('is-invalid');
          fullNameFeedback.textContent = '';
          validateBasicInfo();
        }
      })
      .catch(err => {
        console.error("Full name check failed", err);
        validateBasicInfo(); // fallback
      });
  }, 150);

  const debouncedEmailCheck = debounce(() => {
    const email = emailInput.value.trim();
    const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    if (!emailPattern.test(email)) {
      emailInput.classList.add('is-invalid');
      nextButton.disabled = true;
      return;
    }

    fetch(`/check-email/?email=${encodeURIComponent(email)}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          emailInput.classList.add('is-invalid');
          const feedback = emailInput.nextElementSibling;
          if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = 'Email is already registered.';
          }
          nextButton.disabled = true;
        } else {
          emailInput.classList.remove('is-invalid');
          const feedback = emailInput.nextElementSibling;
          if (feedback) feedback.textContent = '';
          validateBasicInfo();
        }
      })
      .catch(err => {
        console.error("Email check failed", err);
        validateBasicInfo(); // fallback
      });
  }, 300);

  // ------------------ Event Listeners ------------------

  fullNameInput.addEventListener('input', () => {
    const fullName = fullNameInput.value.trim();

    // Instant local validation on input (no delay)
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

    if (!/^[A-Za-z\s]+$/.test(fullName)) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Only letters and spaces are allowed.';
      nextButton.disabled = true;
      return;
    }

    fullNameInput.classList.remove('is-invalid');
    fullNameFeedback.textContent = '';

    // Async server validation debounced
    debouncedFullNameCheck(fullName);
  });

  fullNameInput.addEventListener('blur', validateBasicInfo);

  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('is-invalid');
    debouncedEmailCheck();
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('is-invalid');
    passwordFeedback.textContent = '';
    validateBasicInfo();
  });

  passwordInput.addEventListener('blur', () => {
    const password = passwordInput.value;
    if (!isPasswordComplex(password)) {
      passwordInput.classList.add('is-invalid');
      passwordFeedback.textContent = 'Password must be 8+ chars, include uppercase, lowercase, number & special char.';
      nextButton.disabled = true;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordFeedback.textContent = '';
      validateBasicInfo();
    }
  });

  // ------------------ Tab Navigation ------------------

  document.querySelectorAll('.next-tab').forEach(button => {
    button.addEventListener('click', () => {
      const currentTab = button.closest('.tab-pane');
      const inputs = currentTab.querySelectorAll('input[required]');
      let isValid = validateInputs(inputs);

      if (currentTab.id === "basic") {
        validateBasicInfo();
        isValid = isValid && isPasswordComplex(passwordInput.value) && validatePasswordMatch();
      }

      if (isValid) {
        const activeTab = document.querySelector('#onboardingTabs .nav-link.active');
        const nextTabLi = activeTab.closest('li').nextElementSibling;
        if (nextTabLi) {
          const nextTabLink = nextTabLi.querySelector('.nav-link');
          if (nextTabLink) {
            new bootstrap.Tab(nextTabLink).show();
          }
        }
      }
    });
  });

  document.querySelectorAll('.prev-tab').forEach(button => {
    button.addEventListener('click', () => {
      const activeTab = document.querySelector('#onboardingTabs .nav-link.active');
      const prevTabLi = activeTab.closest('li').previousElementSibling;
      if (prevTabLi) {
        const prevTabLink = prevTabLi.querySelector('.nav-link');
        if (prevTabLink) {
          new bootstrap.Tab(prevTabLink).show();
        }
      }
    });
  });

  // ------------------ Final Form Validation ------------------

  document.getElementById('onboardingForm').addEventListener('submit', (e) => {
    const lastTab = document.querySelector('.tab-pane.active');
    const inputs = lastTab.querySelectorAll('input[required]');
    let isValid = validateInputs(inputs);

    if (!validatePasswordMatch()) isValid = false;

    if (!isValid) {
      e.preventDefault();
      alert("Please fill all required fields correctly before submitting.");
    }
  });

  // ------------------ Initial State ------------------

  nextButton.disabled = true;
});
