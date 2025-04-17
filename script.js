document
  .getElementById("certificate-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value;
    const school = document.getElementById("school").value;
    const workshop = document.getElementById("workshop").value;
    const uid = document.getElementById("uid").value;

    const res = await fetch("http://localhost:3001/get-certificate-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, uid, workshop }),
    });

    const data = await res.json();

    if (res.ok) {
      const { certificateFileName, textColor } = data;
      generateCertificate(name, school, certificateFileName, textColor);
    } else {
      alert(data.error || "Something went wrong!");
    }
  });

function generateCertificate(name, school, certificateFileName, textColor) {
  const canvas = document.getElementById("certificate-canvas");
  const ctx = canvas.getContext("2d");

  const image = new Image();
  image.src = `certificates/${certificateFileName}`;

  image.onload = () => {
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    ctx.font = "bold 60px Charm, cursive";
    ctx.fillStyle = textColor;
    ctx.textAlign = "center";

    ctx.fillText(name, canvas.width / 2, 1100);
    ctx.fillText(school, canvas.width / 2, 1325);

    const link = document.createElement("a");
    link.download = "certificate.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };
}
