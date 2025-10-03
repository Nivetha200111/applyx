import { readFile } from "node:fs/promises";

async function main() {
  try {
    const buf = await readFile("README.md");

    const form = new FormData();
    form.append("resume", new Blob([buf], { type: "text/plain" }), "README.md");

    const res = await fetch("http://localhost:3000/api/simple-upload", {
      method: "POST",
      body: form,
    });

    console.log("Status:", res.status);
    console.log("Content-Type:", res.headers.get("content-type"));
    const text = await res.text();
    console.log("Body:\n", text);
  } catch (err) {
    console.error("Request failed:", err);
    process.exit(1);
  }
}

await main();


