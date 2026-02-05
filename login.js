// Client-side interactions for the login page (demo only)
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailError = document.getElementById('emailError');
  const passwordError = document.getElementById('passwordError');
  const togglePwd = document.getElementById('togglePwd');
  const forgotBtn = document.getElementById('forgotBtn');
  const modal = document.getElementById('modal');
  const closeModal = document.getElementById('closeModal');
  const resetForm = document.getElementById('resetForm');
  const resetEmail = document.getElementById('resetEmail');
  const resetEmailError = document.getElementById('resetEmailError');
  const signupBtn = document.getElementById('signupBtn');
  const signupModal = document.getElementById('signupModal');
  const signupForm = document.getElementById('signupForm');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const signupEmailError = document.getElementById('signupEmailError');
  const signupPasswordError = document.getElementById('signupPasswordError');

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const showError = (el, msg = '') => { el.textContent = msg; };

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    let ok = true;

    const emailVal = email.value.trim();
    const pwdVal = password.value;

    if (!validateEmail(emailVal)) {
      showError(emailError, 'Please enter a valid email');
      ok = false;
    } else {
      showError(emailError);
    }

    if (!pwdVal || pwdVal.length < 6) {
      showError(passwordError, 'Password must be 6+ characters');
      ok = false;
    } else {
      showError(passwordError);
    }

    if (!ok) return;

    try {
      const resp = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: pwdVal })
      });

      const data = await resp.json();
      if (!resp.ok) {
        showError(passwordError, data.error || 'Login failed');
        return;
      }

      alert('Signed in — welcome ' + (data.user?.email || ''));
      loginForm.reset();
    } catch (err) {
      showError(passwordError, 'Network error');
      console.error(err);
    }
  });

  togglePwd.addEventListener('click', function () {
    const shown = password.type === 'password';
    password.type = shown ? 'text' : 'password';
    this.setAttribute('aria-label', shown ? 'Hide password' : 'Show password');
  });

  // Modal controls
  forgotBtn.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('show');
    setTimeout(() => resetEmail.focus(), 50);
  });

  closeModal.addEventListener('click', () => {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('show');
  });

  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const val = resetEmail.value.trim();

    if (!validateEmail(val)) {
      showError(resetEmailError, 'Enter a valid email');
      return;
    }

    showError(resetEmailError);
    const btn = resetForm.querySelector('button[type="submit"]');
    const prev = btn.textContent;
    btn.textContent = 'Sending…';
    btn.disabled = true;

    try {
      const resp = await fetch('/api/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: val })
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Error');

      alert(data.message || 'If the account exists, you will receive an email');
      resetForm.reset();
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('show');
    } catch (err) {
      console.error(err);
      alert('Failed to request reset');
    } finally {
      btn.textContent = prev;
      btn.disabled = false;
    }
  });

  // Signup modal controls
  signupBtn.addEventListener('click', () => {
    signupModal.setAttribute('aria-hidden', 'false');
    signupModal.classList.add('show');
    setTimeout(() => signupEmail.focus(), 50);
  });

  document.getElementById('closeSignup').addEventListener('click', () => {
    signupModal.setAttribute('aria-hidden', 'true');
    signupModal.classList.remove('show');
  });

  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailVal = signupEmail.value.trim();
    const pwdVal = signupPassword.value;

    let ok = true;
    if (!validateEmail(emailVal)) { signupEmailError.textContent = 'Enter a valid email'; ok = false; } else signupEmailError.textContent = '';
    if (!pwdVal || pwdVal.length < 6) { signupPasswordError.textContent = 'Password must be 6+ characters'; ok = false; } else signupPasswordError.textContent = '';
    if (!ok) return;

    const btn = signupForm.querySelector('button[type="submit"]');
    const prev = btn.textContent; btn.textContent = 'Creating…'; btn.disabled = true;

    try {
      const resp = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailVal, password: pwdVal })
      });
      const data = await resp.json();
      if (!resp.ok) {
        if (resp.status === 409) signupEmailError.textContent = data.error || 'Email already exists';
        else alert(data.error || 'Failed to create account');
        return;
      }

      alert('Account created — you can now sign in');
      signupForm.reset();
      signupModal.setAttribute('aria-hidden', 'true');
      signupModal.classList.remove('show');
    } catch (err) {
      console.error(err);
      alert('Network error');
    } finally {
      btn.textContent = prev; btn.disabled = false;
    }
  });

  // Close modal on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
      modal.setAttribute('aria-hidden', 'true');
      modal.classList.remove('show');
    }
  });
});
