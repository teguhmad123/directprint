const fs = require("fs");
const request = require("request-promise-native");
const express = require("express");
const app = express();
const port = 3003;

var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "25mb" })); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

const ptp = require("pdf-to-printer");

const http = require("http");
const path = require("path");

app
  .post("/print_old", (req, res) => {
    console.log(req.body);
    let url = req.body.url; // url file pdf
    let printer = req.body.printer; // Nama printer
    let copies = req.body.copies;
    let paperSize = req.body.paperSize; // A4, A5, Letter sesuai setting/nama di printer device
    let scale = req.body.scale; // noscale, shrink and fit

    let filename = generateString(5);
    http.get(url, function (resp) {
      var chunks = [];
      resp.on("data", function (chunk) {
        chunks.push(chunk);

        fs.writeFileSync("./tmp/" + filename + ".pdf", chunk);
      });

      resp.on("end", function () {
        const options = {};
        if (printer) options.printer = printer;
        if (copies) options.copies = copies;
        if (paperSize) options.paperSize = paperSize;
        if (scale) options.scale = scale;

        ptp.print("./tmp/" + filename + ".pdf", options).then(
          res.json({
            code: "200",
            status: "success",
          })
        );
      });
    });
  })
  .on("error", function () {
    console.log("error");
    res.json({
      code: "500",
      status: "Error",
    });
  });

app
  .post("/print", (req, res) => {
    console.log(req.body);
    let url = req.body.url; // url file pdf
    let printer = req.body.printer; // Nama printer
    let copies = req.body.copies;
    let paperSize = req.body.paperSize; // A4, A5, Letter sesuai setting/nama di printer device
    let scale = req.body.scale; // noscale, shrink and fit
    let filename = generateString(5);
    const file = fs.createWriteStream("./tmp/" + filename + ".pdf");
    const request = http.get(url, function (response) {
      response.pipe(file);

      // after download completed close filestream
      file.on("finish", () => {
        file.close();
        // console.log("Download Completed");

        const options = {};
        if (printer) options.printer = printer;
        if (copies) options.copies = copies;
        if (paperSize) options.paperSize = paperSize;
        if (scale) options.scale = scale;

        ptp.print("./tmp/" + filename + ".pdf", options).then(
          res.json({
            code: "200",
            status: "success",
          })
        );
      });
    });
  })
  .on("error", function () {
    console.log("error");
    res.json({
      code: "500",
      status: "Error",
    });
  });

async function downloadPDF(pdfURL, outputFilename) {
  let pdfBuffer = await request.get({ uri: pdfURL, encoding: null });
  console.log(pdfBuffer);
  console.log("Writing downloaded PDF file to " + outputFilename + "...");
  fs.writeFileSync("./tmp/" + outputFilename, pdfBuffer);
}

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

function generateString(length) {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

function deleteOldTmp() {
  var uploadsDir = __dirname + "/tmp";

  fs.readdir(uploadsDir, function (err, files) {
    files.forEach(function (file, index) {
      fs.stat(path.join(uploadsDir, file), function (err, stat) {
        var endTime, now;
        if (err) {
          return console.error(err);
        }
        now = new Date().getTime();
        endTime = new Date(stat.ctime).getTime() + 3600000;
        if (now > endTime) {
          fs.unlink(path.join(uploadsDir, file), (err) => {
            if (err) {
              return console.error(err);
            }
            console.log("successfully deleted");
          });
        }
      });
    });
  });
}

setInterval(deleteOldTmp, 3600000);

app.use("/", (req, res) => {
  res.json({
    code: "404",
    status: "Not Found",
  });
});

app.listen(port, () => {
  console.log(`DirectPrint listening on port ${port}`);
});
