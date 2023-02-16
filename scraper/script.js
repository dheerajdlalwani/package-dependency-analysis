const dotenv = require("dotenv");

dotenv.config()

fetch(
    "https://api.github.com/search/repositories?q=topic:javascript&page=5", 
    
    {
        method: "GET",
        headers:
        {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        }
    }
    )
    .then
    (
        (res) => 
        {
            res.json().then((data) => console.log(data.items.length))
        }
    )
