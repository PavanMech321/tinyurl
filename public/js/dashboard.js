function copyText(text) {
  navigator.clipboard.writeText(text).then(() => {
    // Optional: toast
  });
}

function show(el) { el.classList.remove('hidden'); }
function hide(el) { el.classList.add('hidden'); }

function validateUrl(u) {
  try { const x = new URL(u); return ['http:', 'https:'].includes(x.protocol); } catch { return false; }
}
function validateCode(c) {
  return /^[a-z0-9\-]{3,32}$/.test(c);
}

async function handleAdd(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const url = form.url.value.trim();
  const code = form.code.value.trim().toLowerCase();

  const urlError = document.getElementById('urlError');
  const codeError = document.getElementById('codeError');
  const successMsg = document.getElementById('successMsg');
  const errorMsg = document.getElementById('errorMsg');

  hide(urlError); hide(codeError); hide(successMsg); hide(errorMsg);

  if (!validateUrl(url)) { show(urlError); return false; }
  if (code && !validateCode(code)) { show(codeError); return false; }

  submitBtn.disabled = true;
  try {
    const res = await fetch('/api/links', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, code: code || undefined })
    });
    if (res.ok) {
      show(successMsg);
      setTimeout(() => { window.location.reload(); }, 600);
    } else {
      const data = await res.json().catch(() => ({}));
      errorMsg.textContent = data.message || 'Error creating link.';
      show(errorMsg);
    }
  } catch {
    errorMsg.textContent = 'Network error.';
    show(errorMsg);
  } finally {
    submitBtn.disabled = false;
  }
  return false;
}

async function handleDelete(e) {
  e.preventDefault();
  const form = e.target;
  const code = form.getAttribute('data-code');
  if (!confirm(`Delete ${code}? This cannot be undone.`)) return false;

  try {
    const res = await fetch(`/api/links/${code}`, { method: 'DELETE' });
    if (res.status === 204) {
      window.location.reload();
    } else if (res.status === 404) {
      alert('Link not found (already deleted).');
      window.location.reload();
    } else {
      alert('Failed to delete.');
    }
  } catch {
    alert('Network error.');
  }
  return false;
}