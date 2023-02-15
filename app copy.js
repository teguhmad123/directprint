const fs = require("fs");
const request = require("request-promise-native");
const express = require("express");
const app = express();
const port = 3000;

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
// const printers = await ptp.getPrinters();

const http = require("http");

app.get("/", (req, res) => {
  // res.sendFile("./index.html", { root: __dirname });
  // res.send()

  let buff = new Buffer(base64, "base64");
  // const buff = Buffer.from(data, "base64").toString("utf8");
  // fs.writeFileSync("stack-abuse-logo-out.png", buff);
  fs.writeFileSync("ex.pdf", buff);

  // console.log("Base64 image data converted to file: stack-abuse-logo-out.png");

  const printerName = "EPSON L3210 Series";
  // for (const p of printers) {
  //   console.log(`PRINTER Name: ${p.name} compare: ${p.name === printerName}`);
  // }
  // console.log(printers);

  const options = {
    printer: "EPSON L3110 Series (Copy 1)",
  };

  // ptp.print("example.pdf", options).then(console.log);
  ptp.print("ex.pdf", options).then(console.log);
  // res.setHeader("");
  const path = "example.pdf";
  res.contentType("application/pdf");
  fs.createReadStream(path).pipe(res);
});

app.get("/tes", (req, res) => {
  res.send(require("path").join(__dirname, "app.js"));
});

app.post("/print", (req, res) => {
  res.status("200");
  res.send("200!");
  console.log(req.body);
});

app
  .post("/read", (req, res) => {
    var url =
      "http://localhost/wiku/wi_simrs/index.php/pendaftaran/cetak/cetak_etiket/1/2302150002";

    http.get(url, function (resp) {
      var chunks = [];
      resp.on("data", function (chunk) {
        console.log("start");
        chunks.push(chunk);
        console.log(chunk);

        fs.writeFileSync("axa.pdf", chunk);
      });

      resp.on("end", function () {
        console.log("downloaded");
        // var jsfile = new Buffer.concat(chunks).toString("base64");
        var jsfile = new Buffer.concat(chunks);
        fs.writeFileSync("exa.pdf", jsfile);
        console.log("converted to base64");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Allow-Headers", "X-Requested-With");
        res.setHeader("content-type", "application/pdf");
        // res.setHeader("Content-Type", "text/pdf");
        res.send(jsfile);

        const options = {
          printer: "Microsoft Print to PDF",
        };

        // ptp.print("example.pdf", options).then(console.log);
        ptp.print("exa.pdf", options).then(console.log);
      });
    });
    // };
  })
  .on("error", function () {
    console.log("error");
  });

async function downloadPDF(pdfURL, outputFilename) {
  let pdfBuffer = await request.get({ uri: pdfURL, encoding: null });
  console.log(pdfBuffer);
  console.log("Writing downloaded PDF file to " + outputFilename + "...");
  fs.writeFileSync(outputFilename, pdfBuffer);
}

async function printPDF(pdf, printer) {}

app.use("/", (req, res) => {
  downloadPDF(
    "http://localhost/wiku/wi_simrs/index.php/pendaftaran/cetak/cetak_etiket/1/2302150002",
    "tes.pdf"
  );
  res.status("404");
  res.send("404!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
