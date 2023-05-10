const http = require("http");
const fs = require("fs");
const path = require("path");

const directoryToIndex = "Insert here your directory";

const server = http.createServer((req, res) => {
  // Set the content type to JSON
  res.setHeader("Content-Type", "application/json");

  // Allow other domains to send requests
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Read the contents of the directory
  fs.readdir(directoryToIndex, (err, files) => {
    if (err) {
      console.error(`Error reading directory: ${err}`);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: "Internal server error" }));
      return;
    }

    const index = {};

    // Read the contents of all files and store them in the index
    Promise.all(
      files
        .filter((file) => path.extname(file).toLowerCase() === ".html")
        .map((file) => {
          const filePath = path.join(directoryToIndex, file);

          return new Promise((resolve, reject) => {
            fs.readFile(filePath, "utf-8", (err, data) => {
              if (err) {
                reject(err);
              } else {
                index[filePath] = data;
                resolve();
              }
            });
          });
        })
    )
      .then(() => {
        // Return the index with the contents of all files
        res.statusCode = 200;
        res.end(JSON.stringify(index));
      })
      .catch((err) => {
        console.error(`Error reading file: ${err}`);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: "Internal server error" }));
      });
  });
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
