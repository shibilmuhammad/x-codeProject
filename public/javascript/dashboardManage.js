const popup = document.getElementById("voucherUploadPopup");
async function showVoucherAddPopUp() {
  popup.style.display = "flex";
  document.body.style.height = "100vh";
  document.body.style.overflow = "hidden";

  try {
    const response = await fetch("/generate-code", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch the voucher code");
    }

    const data = await response.json();
    const generatedCode = data.code;
    const voucherCodeInput = document.getElementById("code");
    voucherCodeInput.value = generatedCode;
  } catch (error) {
    console.error("Error:", error);
    popup.style.display = "none";
    document.body.style.height = "auto";
    document.body.style.overflow = "auto";
  }
}

function hidePopup() {
  popup.style.display = "none";
  document.body.style.height = "auto";
  document.body.style.overflow = "auto";
}

const form = document.getElementById("voucherForm");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const title = document.getElementById("title").value;
  let offer_percentage = document.getElementById("offer_percentage").value;
  if (offer_percentage > 100) {
    alert("Offer percentage should be less than 100");
    return;
  }

  const expiry_date = document.getElementById("expiry_date").value;
  const code = document.getElementById("code").value;

  var formData = {
    title,
    offer_percentage,
    expiry_date,
    code,
  };

  try {
    // Fetch settings from the server
    const response = await fetch('/settings/getsettings');
    const settings = await response.json();

    // Convert expiry_date to Date object and set time to 00:00:00 for accurate comparison
    const selectedExpiryDate = new Date(expiry_date);
    selectedExpiryDate.setHours(0, 0, 0, 0); // Set to midnight

    // Get the current date and set time to 00:00:00
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to midnight

    // Calculate the difference in days between the current date and the expiry date
    const totalDaysSelected = Math.floor((selectedExpiryDate - currentDate) / (1000 * 60 * 60 * 24));

    // Check if the total days exceed the max expiry time
    if (totalDaysSelected > settings.max_expiry_time) {
      alert(`The maximum allowed expiry time is ${settings.max_expiry_time} days.`);
      return; // Prevent further form submission if validation fails
    }

    // Continue creating the voucher if validation passes
    console.log("form data after try", formData);

    const voucherResponse = await fetch("/create-voucher", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (!voucherResponse.ok) {
      throw new Error("Failed to create voucher");
    }

    const data = await voucherResponse.json();
    alert("Voucher created successfully");
    form.reset();
    hidePopup();
    location.reload();

  } catch (error) {
    console.error("Error:", error);
    alert("There was an error creating the voucher. Please try again.");
  }
});


document.querySelectorAll(".export-pdf-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.getAttribute("data-code");

    try {
      const response = await fetch(`/voucher/${code}/pdf`);
      if (!response.ok) {
        throw new Error("Failed to export PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `Voucher-${code}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to export PDF");
    }
  });
});

document.querySelectorAll(".print-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const code = button.getAttribute("data-code");

    const response = await fetch(`/vouchers/${code}`);
    const voucher = await response.json();
    console.log('voucher is ',voucher);
    const printWindow = window.open("", "_blank");

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Voucher</title>
        <style>
          * {
            margin: 0;
            padding: 0;
          }
          body {
            background: lightblue;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .coupon {
            width: 400px;
            height: 200px;
            border-radius: 10px;
            overflow: hidden;
            margin: auto;
            filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.5));
            display: flex;
            align-items: stretch;
            position: relative;
            text-transform: uppercase;
          }
          .coupon::before,
          .coupon::after {
            content: "";
            position: absolute;
            top: 0;
            width: 50%;
            height: 100%;
            z-index: -1;
          }
          .coupon::before {
            left: 0;
            background-image: radial-gradient(circle at 0 50%, transparent 25px, gold 26px);
          }
          .coupon::after {
            right: 0;
            background-image: radial-gradient(circle at 100% 50%, transparent 25px, gold 26px);
          }
          .coupon > div {
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .left {
            width: 20%;
            border-right: 2px dashed rgba(0, 0, 0, 0.13);
          }
          .left div {
            transform: rotate(-90deg);
            white-space: nowrap;
            font-weight: bold;
          }
          .center {
            flex-grow: 1;
            text-align: center;
          }
          .right {
            width: 120px;
            background-image: radial-gradient(circle at 100% 50%, transparent 25px, #fff 26px);
          }
          .right div {
            font-family: "Libre Barcode 128 Text", cursive;
            font-size: 1.5rem;
            font-weight: 400;
            transform: rotate(-90deg);
          }
          .center h2 {
            background: #000;
            color: gold;
            padding: 0 10px;
            font-size: 1.15rem;
            white-space: nowrap;
          }
          .center h3 {
            font-size: 1.15rem;
          }
          .center small {
            font-size: 0.625rem;
            font-weight: 600;
            letter-spacing: 2px;
          }
          .qrCodeImg {
            width: 100px;
            height: 100px;
            object-fit: contain;
          }
          @media screen and (max-width: 500px) {
            .coupon {
              display: grid;
              grid-template-columns: 1fr;
            }
            .left div {
              transform: rotate(0deg);
            }
            .right div {
              transform: rotate(0deg);
            }
          }
        </style>
      </head>
      <body>
        <div class="coupon">
          <div class="left">
            <div>${voucher.title}</div>
          </div>
          <div class="center">
            <div>
              <h2>${voucher.offer_percentage}% OFF</h2>
              <h3>Coupon</h3>
              <div>
                <img class="qrCodeImg" src="https://xcode.identitie.in/assets/qrcodes/${voucher.qr_code_path}" alt="QR Code" />
              </div>
              <small>Valid until ${new Date(voucher.expiry_date).toLocaleDateString('en-GB', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
              })}</small>
            </div>
          </div>
          <div class="right">
            <div>${voucher.code}</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  });
});

