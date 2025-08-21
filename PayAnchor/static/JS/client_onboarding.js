document.addEventListener("DOMContentLoaded", () => {
  console.log("✅ JS Loaded1!");

  // --- Elements ---
  const nextButton = document.getElementById('nextBasic');
  const fullNameInput = document.getElementById('fullNameInput');
  const fullNameFeedback = document.getElementById('fullNameFeedback');
  const emailInput = document.getElementById('emailInput');
  const passwordInput = document.getElementById('password');
  const passwordFeedback = document.getElementById('passwordFeedback');
  const confirmPasswordInput = document.querySelector('input[name="confirm_password"]');
  const confirmPasswordFeedback = confirmPasswordInput ? confirmPasswordInput.nextElementSibling : null;

  // Company tab elements
  const companyTab = document.getElementById("company");
  const companyNameInput = companyTab.querySelector('input[name="company_name"]');
  const companyEmailInput = companyTab.querySelector('input[name="company_email"]');
  const bussinessNumberInput = companyTab.querySelector('input[name="bussiness_number"]');  // updated here
  const piNumberInput = companyTab.querySelector('input[name="pi_number"]');
  const referenceNumberInput = companyTab.querySelector('input[name="reference_number"]');
  const bnGroup = bussinessNumberInput.closest('.mb-3');
  const bnFeedback = bnGroup.querySelector('#bnFeedback');
  const payrolYearInput = document.getElementById("yearDropdown"); // updated name here
  const industrytypeInput = companyTab.querySelector('input[name="industry_type"]');

  // Regex Patterns
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const postalcodePattern = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;  // allow optional space

  // --- Utilities ---
  const debounce = (fn, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn(...args), delay);
    };
  };

  const isPasswordComplex = (pwd) => {
    return (
      /[A-Z]/.test(pwd) &&
      /[a-z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd) &&
      pwd.length >= 8
    );
  };

  // --- Global state flag to track email validity ---
  let emailIsValid = false;

  // --- Async AJAX checks ---

  const debouncedFullNameCheck = debounce(name => {
    if (!name) return;

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
          checkEnableNext();
        }
      })
      .catch(() => {
        fullNameInput.classList.remove('is-invalid');
        fullNameFeedback.textContent = '';
        checkEnableNext();
      });
  }, 300);

  const debouncedEmailCheck = debounce(email => {
    if (!emailPattern.test(email)) {
      emailInput.classList.add('is-invalid');
      if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Invalid email format.';
      nextButton.disabled = true;
      emailIsValid = false;
      return;
    }

    fetch(`/check-email/?email=${encodeURIComponent(email.toLowerCase())}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          emailInput.classList.add('is-invalid');
          if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Email is already registered.';
          nextButton.disabled = true;
          emailIsValid = false;
        } else {
          emailInput.classList.remove('is-invalid');
          if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
          emailIsValid = true;
          checkEnableNext();
        }
      })
      .catch(() => {
        emailInput.classList.remove('is-invalid');
        if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
        emailIsValid = false;
        checkEnableNext();
      });
  }, 300);

  // --- Validation functions ---

  function validateBasicInfoLocal() {
    let valid = true;

    const fullName = fullNameInput.value.trim();
    if (!/^[A-Za-z\s]{5,100}$/.test(fullName)) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name must be 5-100 letters2 and spaces only.';
      valid = false;
    } else {
      fullNameInput.classList.remove('is-invalid');
      fullNameFeedback.textContent = '';
    }

    const email = emailInput.value.trim();
    if (!emailPattern.test(email)) {
      emailInput.classList.add('is-invalid');
      if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Invalid email format.';
      valid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
    }

    const pwd = passwordInput.value;
    if (!isPasswordComplex(pwd)) {
      passwordInput.classList.add('is-invalid');
      passwordFeedback.textContent = 'Password must be 8+ chars and include uppercase, lowercase, number & special char.';
      valid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordFeedback.textContent = '';
    }

    if (confirmPasswordInput) {
      if (confirmPasswordInput.value !== pwd || !confirmPasswordInput.value) {
        confirmPasswordInput.classList.add('is-invalid');
        if (confirmPasswordFeedback) confirmPasswordFeedback.textContent = 'Passwords do not match.';
        valid = false;
      } else {
        confirmPasswordInput.classList.remove('is-invalid');
        if (confirmPasswordFeedback) confirmPasswordFeedback.textContent = '';
      }
    }

    return valid;
  }

  function checkEnableNext() {
    const localValid = validateBasicInfoLocal();

    const hasInvalid = fullNameInput.classList.contains('is-invalid') ||
      emailInput.classList.contains('is-invalid') ||
      passwordInput.classList.contains('is-invalid') ||
      (confirmPasswordInput && confirmPasswordInput.classList.contains('is-invalid'));

    nextButton.disabled = !(localValid && !hasInvalid && emailIsValid);
  }

  function validateCompanyInfo() {
    let valid = true;

    const companyName = companyNameInput.value.trim();
    if (!/^[A-Za-z0-9\s.\-&]{2,100}$/.test(companyName)) {
      companyNameInput.classList.add('is-invalid');
      companyNameInput.nextElementSibling.textContent = 'Enter a valid Company Name!';
      valid = false;
    } else {
      companyNameInput.classList.remove('is-invalid');
      companyNameInput.nextElementSibling.textContent = '';
    }

    const compEmail = companyEmailInput.value.trim();
    if (!emailPattern.test(compEmail)) {
      companyEmailInput.classList.add('is-invalid');
      companyEmailInput.nextElementSibling.textContent = 'Enter a valid Company Email!';
      valid = false;
    } else {
      companyEmailInput.classList.remove('is-invalid');
      companyEmailInput.nextElementSibling.textContent = '';
    }

    const bussinessValid = /^\d{9}$/.test(bussinessNumberInput.value.trim()); // updated var name
    const piValid = /^[A-Z]{2}$/.test(piNumberInput.value.trim().toUpperCase());
    const refValid = /^\d{4}$/.test(referenceNumberInput.value.trim());

    if (!bussinessValid || !piValid || !refValid) {
      bnGroup.querySelectorAll('input').forEach(inp => inp.classList.add('is-invalid'));
      if (bnFeedback) bnFeedback.textContent = 'Enter a valid Business Number (e.g. 123456789 RP 0001)';
      valid = false;
    } else {
      bnGroup.querySelectorAll('input').forEach(inp => inp.classList.remove('is-invalid'));
      if (bnFeedback) bnFeedback.textContent = '';
    }

    if (!payrolYearInput.value) {  // updated var name
      payrolYearInput.classList.add('is-invalid');
      valid = false;
    } else {
      payrolYearInput.classList.remove('is-invalid');
    }

    const industryVal = industrytypeInput.value.trim();
    if (!industryVal) {
      industrytypeInput.classList.add('is-invalid');
      industrytypeInput.nextElementSibling.textContent = 'Industry type is required.';
      valid = false;
    } else {
      industrytypeInput.classList.remove('is-invalid');
      industrytypeInput.nextElementSibling.textContent = '';
    }

    return valid;
  }

  function validateAddress() {
    let valid = true;

    const addressLine1Input = document.getElementById("address_line1");
    const addressLine2Input = document.getElementById("address_line2");
    const cityInput = document.getElementById("city");
    const postalcodeInput = document.getElementById("postal_code");
    const provinceInput = document.getElementById("province");
    const countryInput = document.getElementById("country");

    if (!addressLine1Input.value.trim()) {
      addressLine1Input.classList.add('is-invalid');
      addressLine1Input.nextElementSibling.textContent = 'Address Line 1 is required.';
      valid = false;
    } else {
      addressLine1Input.classList.remove('is-invalid');
      addressLine1Input.nextElementSibling.textContent = '';
    }

    if (!addressLine2Input.value.trim()) {
      addressLine2Input.classList.add('is-invalid');
      addressLine2Input.nextElementSibling.textContent = 'Address Line 2 is required.';
      valid = false;
    } else {
      addressLine2Input.classList.remove('is-invalid');
      addressLine2Input.nextElementSibling.textContent = '';
    }

    if (!cityInput.value.trim()) {
      cityInput.classList.add('is-invalid');
      cityInput.nextElementSibling.textContent = 'City is required.';
      valid = false;
    } else {
      cityInput.classList.remove('is-invalid');
      cityInput.nextElementSibling.textContent = '';
    }

    const postalVal = postalcodeInput.value.trim().toUpperCase();
    postalcodeInput.value = postalVal;

    if (!postalcodePattern.test(postalVal)) {
      postalcodeInput.classList.add('is-invalid');
      postalcodeInput.nextElementSibling.textContent = 'Postal code must be in format A1B 2C3.';
      valid = false;
    } else {
      postalcodeInput.classList.remove('is-invalid');
      postalcodeInput.nextElementSibling.textContent = '';
    }

    if (!provinceInput.value.trim()) {
      provinceInput.classList.add('is-invalid');
      provinceInput.nextElementSibling.textContent = 'Province is required.';
      valid = false;
    } else {
      provinceInput.classList.remove('is-invalid');
      provinceInput.nextElementSibling.textContent = '';
    }

    if (!countryInput.value.trim()) {
      countryInput.classList.add('is-invalid');
      countryInput.nextElementSibling.textContent = 'Country is required.';
      valid = false;
    } else {
      countryInput.classList.remove('is-invalid');
      countryInput.nextElementSibling.textContent = '';
    }

    return valid;
  }

  // --- Payroll Year Dropdown Setup ---
  if (payrolYearInput) {
    const currentYear = new Date().getFullYear();
    payrolYearInput.innerHTML = ''; // clear options
    for (let y = currentYear; y <= currentYear + 1; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      payrolYearInput.appendChild(option);
    }
  }

  // --- Event Listeners ---

  fullNameInput.addEventListener('input', () => {
    const val = fullNameInput.value.trim();
    if (!/^[A-Za-z\s]*$/.test(val)) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Only letters and spaces allowed.';
      nextButton.disabled = true;
      return;
    }
    fullNameInput.classList.remove('is-invalid');
    fullNameFeedback.textContent = '';

    if (val.length < 5) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name must be at least 5 characters.';
      nextButton.disabled = true;
      return;
    }
    if (val.length > 100) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name max length is 100 characters.';
      nextButton.disabled = true;
      return;
    }

    debouncedFullNameCheck(val);
  });

  fullNameInput.addEventListener('blur', () => {
    validateBasicInfoLocal();
    checkEnableNext();
  });

  emailInput.addEventListener('input', () => {
    emailInput.classList.remove('is-invalid');
    if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
    debouncedEmailCheck(emailInput.value.trim());
  });

  passwordInput.addEventListener('input', () => {
    passwordInput.classList.remove('is-invalid');
    passwordFeedback.textContent = '';
    checkEnableNext();
  });

  passwordInput.addEventListener('blur', () => {
    if (!isPasswordComplex(passwordInput.value)) {
      passwordInput.classList.add('is-invalid');
      passwordFeedback.textContent = 'Password must be 8+ chars, include uppercase, lowercase, number & special char.';
      nextButton.disabled = true;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordFeedback.textContent = '';
      checkEnableNext();
    }
  });

  if (confirmPasswordInput) {
    confirmPasswordInput.addEventListener('input', () => {
      if (confirmPasswordInput.value !== passwordInput.value) {
        confirmPasswordInput.classList.add('is-invalid');
        if (confirmPasswordFeedback) confirmPasswordFeedback.textContent = 'Passwords do not match.';
        nextButton.disabled = true;
      } else {
        confirmPasswordInput.classList.remove('is-invalid');
        if (confirmPasswordFeedback) confirmPasswordFeedback.textContent = '';
        checkEnableNext();
      }
    });
  }

  // --- Tab navigation (next/prev) ---

  document.querySelectorAll('.next-tab').forEach(button => {
    button.addEventListener('click', () => {
      const currentTab = button.closest('.tab-pane');
      let valid = true;

      if (currentTab.id === 'basic') {
        valid = validateBasicInfoLocal();
        checkEnableNext();

        // Block tab switch if email is invalid (already registered)
        if (!emailIsValid) {
          emailInput.classList.add('is-invalid');
          if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Email is already registered.';
          nextButton.disabled = true;
          return;  // Prevent next tab
        }
      } else if (currentTab.id === 'company') {
        valid = validateCompanyInfo();
      } else if (currentTab.id === 'address') {
        valid = validateAddress();
      }

      if (valid) {
        let nextTabId = null;
        if (currentTab.id === 'basic') nextTabId = 'company';
        else if (currentTab.id === 'company') nextTabId = 'address';

        if (nextTabId) {
          const nextTabLink = document.querySelector(`#onboardingTabs .nav-link[data-bs-target="#${nextTabId}"]`);
          if (nextTabLink) {
            nextTabLink.disabled = false;
            new bootstrap.Tab(nextTabLink).show();
          }
        }
      }
    });
  });

  document.querySelectorAll('.prev-tab').forEach(button => {
    button.addEventListener('click', () => {
      const currentTab = button.closest('.tab-pane');
      let prevTabId = null;

      if (currentTab.id === 'company') prevTabId = 'basic';
      else if (currentTab.id === 'address') prevTabId = 'company';

      if (prevTabId) {
        const prevTabLink = document.querySelector(`#onboardingTabs .nav-link[data-bs-target="#${prevTabId}"]`);
        if (prevTabLink) {
          prevTabLink.disabled = false;
          new bootstrap.Tab(prevTabLink).show();
        }
      }
    });
  });

  // --- Final form submit validation ---
  const form = document.getElementById('onboardingForm');

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Run all validations before submit
    const isBasicValid = validateBasicInfoLocal();   // Note: AJAX email check already updated emailIsValid
    if (!emailIsValid) {
      emailInput.classList.add('is-invalid');
      if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Email is already registered.';
    }

    const isCompanyValid = validateCompanyInfo();
    const isAddressValid = validateAddress();

    if (isBasicValid && emailIsValid && isCompanyValid && isAddressValid) {
      form.submit();
    } else {
      if (!isBasicValid || !emailIsValid) {
        const tab = document.querySelector('button[data-bs-target="#basic"]');
        tab.disabled = false;
        new bootstrap.Tab(tab).show();
      } else if (!isCompanyValid) {
        const tab = document.querySelector('button[data-bs-target="#company"]');
        tab.disabled = false;
        new bootstrap.Tab(tab).show();
      } else if (!isAddressValid) {
        const tab = document.querySelector('button[data-bs-target="#address"]');
        tab.disabled = false;
        new bootstrap.Tab(tab).show();
      }
    }
  });

  // --- Initial Setup ---
  nextButton.disabled = true;

  // Enable all nav tabs initially (optional)
  document.querySelectorAll('#onboardingTabs .nav-link').forEach(t => t.disabled = false);

  // Populate payroll year dropdown
  if (payrolYearInput) {
    const currentYear = new Date().getFullYear();
    payrolYearInput.innerHTML = '';
    for (let y = currentYear; y <= currentYear + 1; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      payrolYearInput.appendChild(option);
    }
  }
});
