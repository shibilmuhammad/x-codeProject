const titleRange = document.getElementById("title-range");
const titleSizeValue = document.getElementById("titleSizeValue");

const textRange = document.getElementById("text-range");
const textSizeValue = document.getElementById("textSizeValue");

// Update the displayed values dynamically
titleRange.addEventListener("input", () => {
  titleSizeValue.textContent = titleRange.value;
});

textRange.addEventListener("input", () => {
  textSizeValue.textContent = textRange.value;
});


const form = document.getElementById('settingsForm');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());
  const response = await fetch('/settings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (response.ok) {
    alert('Settings saved successfully!');
  } else {
    alert('Error saving settings!');
  }
});

window.onload = async () => {
    const response = await fetch('/settings/getsettings');
    const settings = await response.json();
  
    document.getElementById('max_expiry_time').value = settings.max_expiry_time;
    document.getElementById('voucher_width').value = settings.voucher_width;
    document.getElementById('voucherHeight').value = settings.voucher_height;
    document.getElementById('title-range').value = settings.title_font_size;
    document.getElementById('text-range').value = settings.text_font_size;
    titleSizeValue.textContent = settings.title_font_size;
    textSizeValue.textContent = settings.text_font_size;
  };