const fs = require("fs");
const path = require("path");

const basePath = path.resolve(__dirname, "../", "data", "javaScript");
const fileName = "packages-data.json";

const packageData = JSON.parse(
  fs.readFileSync(path.join(basePath, fileName)).toString()
);

let text =
  "Package Name,sunday,monday,tuesday,wednesday,thursday,friday,saturday,normalized_sunday,normalized_monday,normalized_tuesday,normalized_wednesday,normalized_thursday,normalized_friday,normalized_saturday,\n";
const packageDayDistribution = {};
for (let package of Object.keys(packageData)) {
  if (!packageData[package]["time"]) continue;
  packageDayDistribution[package] = new Array();
  for (let i = 0; i <= 13; i++) {
    packageDayDistribution[package].push(0);
  }

  let total_packages = 0;

  let timeOfUploads = packageData[package]["time"];
  for (let version of Object.keys(timeOfUploads)) {
    if (version === "modified" || version === "created") continue;
    packageDayDistribution[package][
      new Date(packageData[package]["time"][version]).getDay()
    ]++;
    total_packages++;
  }
  for (let i = 7; i <= 13; i++) {
    packageDayDistribution[package][i] = (
      packageDayDistribution[package][i - 7] / total_packages
    ).toFixed(4);
  }
}

for (let package of Object.keys(packageDayDistribution)) {
  text += `${package},`;
  for (let i = 0; i < 13; i++) {
    text += `${packageDayDistribution[package][i]},`;
  }
  text += `${packageDayDistribution[package][13]}\n`;
}

fs.writeFileSync(path.join(basePath, "packageDayDistribution.csv"), text);
