const { Octokit } = require("octokit");
const dotenv = require("dotenv");

dotenv.config()

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

await octokit.request('GET /repositories/?q=topic:go', {})