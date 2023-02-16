const dotenv = require("dotenv");

dotenv.config({ path: "../.env" })

const languages = ["go", "python"];

const scraper = async () => {
    for (const language of languages) {
        const response = await fetch(
            `https://api.github.com/search/repositories?q=topic:${language}&per_page=100`,
    
            {
                method: "GET",
                headers: {
                    Accept: "application/vnd.github+json",
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                },
            }
        );

        const { items } = await response.json();

        for(const item of items) {
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
            
            if(!response.status.toString().startsWith("2")) {
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

            for(const file_name of file_names) {
                const raw_url = `https://raw.githubusercontent.com/${item.full_name}/${branch}/${file_name}`
                const response = await fetch(raw_url, {
                    method: "GET"
                });

                if(!response.status.toString().startsWith("2")) {
                    continue;
                }

                const text = await response.text();

                console.log(`The ${file_name} for repository ${item.full_name} is\n`);
                console.log(text);
            }

            console.log("====================================================================");
        }
    }
}


scraper();

