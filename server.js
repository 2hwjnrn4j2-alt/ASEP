// ==========================================================
// IMPORTS DU SERVEUR
// ==========================================================

import { createReadStream } from "node:fs";
import { access, stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

// ==========================================================
// CONFIGURATION DU SERVEUR
// ==========================================================

const root = fileURLToPath(new URL(".", import.meta.url));
const port = Number(process.env.PORT) || 4173;
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
};

// ==========================================================
// GESTION DES REQUÊTES HTTP
// ==========================================================

createServer(async (request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end("Méthode non autorisée");
    return;
  }

  const pathname = new URL(request.url, "http://localhost").pathname;
  const relativePath = pathname === "/" ? "index.html" : decodeURIComponent(pathname).slice(1);
  const filePath = normalize(join(root, relativePath));
  if (!filePath.startsWith(root)) {
    response.writeHead(403).end("Accès refusé");
    return;
  }

  try {
    await access(filePath);
    const fileStats = await stat(filePath);
    if (!fileStats.isFile()) {
      response.writeHead(404).end("Fichier introuvable");
      return;
    }

    response.writeHead(200, {
      "Content-Length": fileStats.size,
      "Content-Type": contentTypes[extname(filePath)] ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    if (request.method === "HEAD") {
      response.end();
    } else {
      createReadStream(filePath).pipe(response);
    }
  } catch {
    response.writeHead(404).end("Fichier introuvable");
  }
}).listen(port, () => {
  console.log(`Le générateur de barèmes est disponible sur http://localhost:${port}`);
});
