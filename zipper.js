const child_process = require("child_process");
const os = require("os");
const path = require("path");

child_process.execSync(`zip -r dataset_compressed.zip dataset`, {
    cwd: "./"
});
