const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config({ path: "../.env" });

const languages = ["javascript", "go", "python"];
const per_page = 100;
let page_number = 1;

const scraper = async () => {
  let number_of_repos = 0;
  for (let i = 0; i < languages.length; ) {
    const language = languages[i];
    const response = await fetch(
      `https://api.github.com/search/repositories?q=topic:${language}&per_page=${per_page}&page=${page_number}`,

      {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      }
    );

    const { items } = await response.json();

    // console.log(items);

    for (const item of items) {
      if (number_of_repos == 100) {
        break;
      }
      const base_url = item.url;
      let branch = "main";
      const branch_url = `${base_url}/branches/${branch}`;
      const response = await fetch(branch_url, {
        method: "GET",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        },
      });

      if (!response.status.toString().startsWith("2")) {
        branch = "master";
      }

      let file_names = ["package.json", "package-lock.json"];

      switch (language) {
        case "go":
          file_names = ["go.sum", "go.mod"];
          break;
        case "python":
          file_names = ["requirements.txt"];
          break;
        default:
          break;
      }

      const requests = [];
      for (const file_name of file_names) {
        const raw_url = `https://raw.githubusercontent.com/${item.full_name}/${branch}/${file_name}`;
        requests.push(
          fetch(raw_url, {
            method: "GET",
          })
        );
      }
      const responses = await Promise.all(requests);
      let not_found = false;
      for (const response of responses) {
        if (!response.status.toString().startsWith("2")) {
          not_found = true;
          break;
        }
      }

      if (not_found) {
        continue;
      }

      number_of_repos++;

      for (const file_name of file_names) {
        const raw_url = `https://raw.githubusercontent.com/${item.full_name}/${branch}/${file_name}`;
        const response = await fetch(raw_url, {
          method: "GET",
        });

        // const response
        // if (!response.status.toString().startsWith("2")) {
        //   continue;
        // }

        const text = await response.text();

        // console.log(`The ${file_name} for repository ${item.full_name} is\n`);
        // console.log(text);

        const repo_dir = path.resolve(
          __dirname,
          `../dataset/${language}/${item.name}`
        );

        if (!fs.existsSync(repo_dir))
          fs.mkdirSync(repo_dir, { recursive: true });

        fs.writeFileSync(`${repo_dir}/${file_name}`, text);
      }
    }
    if (number_of_repos != 100) {
      page_number++;
      // i--;
    }
    if (number_of_repos == 100) {
      page_number = 1;
      number_of_repos = 0;
      i++;
    }
    console.log(`Number of repos for ${language} is ${number_of_repos}`);
  }
};

async function call() {
  await scraper();
  console.log("gtv");
  process.exit();
}

call();
