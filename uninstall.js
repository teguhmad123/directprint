var Service = require("node-windows").Service;

// Create a new service object
var svc = new Service({
  name: "Servide Direct Printing NodeJS",
  description: "Direct Printing NodeJS web server.",
  script: require("path").join(__dirname, "app.js"),
  // nodeOptions: ["--harmony", "--max_old_space_size=4096"],
});

// Listen for the "uninstall" event so we know when it's done.
svc.on("uninstall", function () {
  console.log("Uninstall complete.");
  console.log("The service exists: ", svc.exists);
});

// Uninstall the service.
svc.uninstall();
