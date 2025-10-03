async function toBase64(file) {
  const buf = await file.arrayBuffer();
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

async function send(url, payload) {
  return fetch(url + "/api/upload-resume", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
}

document.getElementById("send").addEventListener("click", async () => {
  const out = document.getElementById("out");
  out.textContent = "Uploading...";
  try {
    const file = document.getElementById("file").files[0];
    if (!file) { out.textContent = "Pick a file"; return; }
    const payload = {
      filename: file.name,
      type: file.type || "application/pdf",
      content: await toBase64(file),
    };

    let res = await send("http://localhost:3000", payload);
    if (!res.ok) res = await send("http://localhost:3001", payload);

    const text = await res.text();
    out.textContent = `Status: ${res.status}\n${text}`;
  } catch (e) {
    out.textContent = String(e);
  }
});


