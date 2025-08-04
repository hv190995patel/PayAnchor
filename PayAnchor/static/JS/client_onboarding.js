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
  const businessNumberInput = companyTab.querySelector('input[name="bussiness_number"]');
  const piNumberInput = companyTab.querySelector('input[name="pi_number"]');
  const referenceNumberInput = companyTab.querySelector('input[name="reference_number"]');
  const bnGroup = businessNumberInput.closest('.mb-3');
  const bnFeedback = bnGroup.querySelector('#bnFeedback');
  const payrollyearInput = document.getElementById("yearDropdown"); // payroll year dropdown
  const industrytypeInput = companyTab.querySelector('input[name="industry_type"]');

  // Address tab elements
  const addressTab = document.getElementById("address");
  const addressLine1Input = addressTab.querySelector('input[name="address_line1"]');
  const addressLine2Input = addressTab.querySelector('input[name="address_line2"]');
  const cityInput = addressTab.querySelector('input[name="city"]');
  const postalcodeInput = addressTab.querySelector('input[name="postal_code"]');
  const provinceInput = addressTab.querySelector('input[name="province"]');
  const countryInput = addressTab.querySelector('input[name="country"]');

  // Regex Patterns
  const emailPattern = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  const postalcodePattern = /^[A-Za-z]\d[A-Za-z]\d[A-Za-z]\d$/;

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
        // On error, don't block user
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
      return;
    }

    fetch(`/check-email/?email=${encodeURIComponent(email.toLowerCase())}`)
      .then(res => res.json())
      .then(data => {
        if (data.exists) {
          emailInput.classList.add('is-invalid');
          if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Email is already registered.';
          nextButton.disabled = true;
        } else {
          emailInput.classList.remove('is-invalid');
          if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
          checkEnableNext();
        }
      })
      .catch(() => {
        emailInput.classList.remove('is-invalid');
        if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
        checkEnableNext();
      });
  }, 300);

  // --- Validation functions ---

  // Basic info local validations + async checks
  function validateBasicInfoLocal() {
    let valid = true;

    // Full Name - letters and spaces only, 5-100 chars
    const fullName = fullNameInput.value.trim();
    if (!/^[A-Za-z\s]{5,100}$/.test(fullName)) {
      fullNameInput.classList.add('is-invalid');
      fullNameFeedback.textContent = 'Full name must be 5-100 letters and spaces only.';
      valid = false;
    } else {
      fullNameInput.classList.remove('is-invalid');
      fullNameFeedback.textContent = '';
    }

    // Email format
    const email = emailInput.value.trim();
    if (!emailPattern.test(email)) {
      emailInput.classList.add('is-invalid');
      if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = 'Invalid email format.';
      valid = false;
    } else {
      emailInput.classList.remove('is-invalid');
      if (emailInput.nextElementSibling) emailInput.nextElementSibling.textContent = '';
    }

    // Password complexity
    const pwd = passwordInput.value;
    if (!isPasswordComplex(pwd)) {
      passwordInput.classList.add('is-invalid');
      passwordFeedback.textContent = 'Password must be 8+ chars and include uppercase, lowercase, number & special char.';
      valid = false;
    } else {
      passwordInput.classList.remove('is-invalid');
      passwordFeedback.textContent = '';
    }

    // Confirm password match
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

  // Check if all basic info validations pass including async checks status (approximate)
  function checkEnableNext() {
    // Only enable next if local validation passes AND no invalid classes on inputs
    const localValid = validateBasicInfoLocal();

    const hasInvalid = fullNameInput.classList.contains('is-invalid') ||
      emailInput.classList.contains('is-invalid') ||
      passwordInput.classList.contains('is-invalid') ||
      (confirmPasswordInput && confirmPasswordInput.classList.contains('is-invalid'));

    nextButton.disabled = !(localValid && !hasInvalid);
  }

  // Company info validations
  function validateCompanyInfo() {
    let valid = true;

    // Company Name: required, alphanumeric + space . & -
    const companyName = companyNameInput.value.trim();
    if (!/^[A-Za-z0-9\s.\-&]{2,100}$/.test(companyName)) {
      companyNameInput.classList.add('is-invalid');
      companyNameInput.nextElementSibling.textContent = 'Enter a valid Company Name!';
      valid = false;
    } else {
      companyNameInput.classList.remove('is-invalid');
      companyNameInput.nextElementSibling.textContent = '';
    }

    // Company Email
    const compEmail = companyEmailInput.value.trim();
    if (!emailPattern.test(compEmail)) {
      companyEmailInput.classList.add('is-invalid');
      companyEmailInput.nextElementSibling.textContent = 'Enter a valid Company Email!';
      valid = false;
    } else {
      companyEmailInput.classList.remove('is-invalid');
      companyEmailInput.nextElementSibling.textContent = '';
    }

    // Business Number group
    const businessValid = /^\d{9}$/.test(businessNumberInput.value.trim());
    const piValid = /^[A-Z]{2}$/.test(piNumberInput.value.trim().toUpperCase());
    const refValid = /^\d{4}$/.test(referenceNumberInput.value.trim());

    if (!businessValid || !piValid || !refValid) {
      bnGroup.querySelectorAll('input').forEach(inp => inp.classList.add('is-invalid'));
      if (bnFeedback) bnFeedback.textContent = 'Enter a valid Business Number (e.g. 123456789 RP 0001)';
      valid = false;
    } else {
      bnGroup.querySelectorAll('input').forEach(inp => inp.classList.remove('is-invalid'));
      if (bnFeedback) bnFeedback.textContent = '';
    }

    // Payroll year (dropdown) required
    if (!payrollyearInput.value) {
      payrollyearInput.classList.add('is-invalid');
      valid = false;
    } else {
      payrollyearInput.classList.remove('is-invalid');
    }

    // Industry Type required
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

  // Address validations
  function validateAddress() {
    let valid = true;

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

    // Postal code uppercase + pattern
    const postalVal = postalcodeInput.value.trim().toUpperCase();
    postalcodeInput.value = postalVal;

    if (!postalcodePattern.test(postalVal)) {
      postalcodeInput.classList.add('is-invalid');
      postalcodeInput.nextElementSibling.textContent = 'Postal code must be in format A1B2C3.';
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
  if (payrollyearInput) {
    const currentYear = new Date().getFullYear();
    for (let y = currentYear; y <= currentYear + 1; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      payrollyearInput.appendChild(option);
    }
  }

  // --- Event Listeners ---

  // Basic Info inputs
  fullNameInput.addEventListener('input', () => {
    const val = fullNameInput.value.trim();
    // local regex check for letters + spaces only
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

    // Async AJAX check
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

  // Enable next tab only if validation passes for current tab
 document.querySelectorAll('.next-tab').forEach(button => {
  button.addEventListener('click', () => {
    const currentTab = button.closest('.tab-pane');
    let valid = true;

    if (currentTab.id === 'basic') {
      valid = validateBasicInfoLocal();
      checkEnableNext();
    } else if (currentTab.id === 'company') {
      valid = validateCompanyInfo();
    } else if (currentTab.id === 'address') {
      valid = validateAddress();
    }

    if (valid) {
      // Show the next tab manually by ID instead of assuming order
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

  // Prev tab buttons - just go back, no validation
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
  const tabContents = [...document.querySelectorAll('.tab-pane')];

  form.addEventListener('submit', e => {
    // Validate all tabs before submit
    for (const tabPane of tabContents) {
      let valid = true;

      if (tabPane.id === 'basic') valid = validateBasicInfoLocal();
      else if (tabPane.id === 'company') valid = validateCompanyInfo();
      else if (tabPane.id === 'address') valid = validateAddress();

      if (!valid) {
        e.preventDefault();
        // Show the invalid tab
        const index = tabContents.indexOf(tabPane);
        const tabs = [...document.querySelectorAll('#onboardingTabs .nav-link')];
        if (tabs[index]) new bootstrap.Tab(tabs[index]).show();
        break;
      }
    }
  });

  // --- Initial Setup ---
  nextButton.disabled = true;

  // Enable all tabs nav links initially (optional)
  document.querySelectorAll('#onboardingTabs .nav-link').forEach(t => t.disabled = false);

  // Populate payroll year dropdown
  if (payrollyearInput) {
    const currentYear = new Date().getFullYear();
    payrollyearInput.innerHTML = ''; // clear options
    for (let y = currentYear; y <= currentYear + 1; y++) {
      const option = document.createElement('option');
      option.value = y;
      option.textContent = y;
      payrollyearInput.appendChild(option);
    }
  }

  document.getElementById('onboardingForm').addEventListener('submit', async function (e) {
    e.preventDefault(); // Always prevent default first

    const isBasicValid = await validateBasicInfoLocal();     // Includes AJAX email check
    const isCompanyValid = validateCompanyInfo();            // CRA & required fields
    const isAddressValid = validateAddress();                // Postal code & required

    // Only submit if all valid
    if (isBasicValid && isCompanyValid && isAddressValid) {
      this.submit();  // ✅ Now safe to submit
    } else {
      // ❌ Show the first invalid tab
      if (!isBasicValid) {
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
});