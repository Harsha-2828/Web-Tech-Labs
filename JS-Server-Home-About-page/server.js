const http = require("http");
const fs   = require("fs");
const path = require("path");

const PORT = 3000;

// -- Middleware: log every incoming request ------------------------------------
function logger(req) {
  console.log(`[${new Date().toISOString()}]  ${req.method}  ${req.url}`);
}

// -- Resolve URL -> absolute file path ----------------------------------------
function resolvePath(url) {
  // Named routes: root always goes to index.html
  if (url === "/" || url === "/index.html") {
    return path.join(__dirname, "public", "index.html");
  }

  // Serve any other file directly from /public (e.g. /style.css, /about.html)
  const safePath = path.join(__dirname, "public", path.normalize(url));

  // Security: make sure the resolved path stays inside /public
  if (!safePath.startsWith(path.join(__dirname, "public"))) return null;

  return safePath;
}

// -- Content-type map ----------------------------------------------------------
const MIME = {
  ".html": "text/html",
  ".css":  "text/css",
  ".js":   "application/javascript",
  ".png":  "image/png",
  ".jpg":  "image/jpeg",
  ".svg":  "image/svg+xml",
};

function contentType(filePath) {
  return MIME[path.extname(filePath)] || "application/octet-stream";
}

// -- Request handler -----------------------------------------------------------
function handleRequest(req, res) {
  logger(req);

  const filePath = resolvePath(req.url);

  if (!filePath) {
    res.writeHead(404, { "Content-Type": "text/html" });
    return res.end("<h1>404 - Page Not Found</h1>");
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/html" });
      return res.end("<h1>404 - File Not Found</h1>");
    }
    res.writeHead(200, { "Content-Type": contentType(filePath) });
    res.end(data, "binary");
  });
}

// -- Create & start server -----------------------------------------------------
const server = http.createServer(handleRequest);

server.on("error", (err) => console.error("Server error:", err.message));

server.listen(PORT, () =>
  console.log(`Server running -> http://localhost:${PORT}/`)
);
