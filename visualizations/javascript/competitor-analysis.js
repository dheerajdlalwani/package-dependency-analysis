const fetch = require("node-fetch");
async function apiRequest(url, options = {}) {
  return fetch(url, options).then((r) => r.json());
}

async function getIssuesForRepo(repo, page = 1) {
  return apiRequest(
    `https://api.github.com/repos/${repo}/issues?page=${page}&per_page=100`
  );
}

async function getAllIssuesForRepo(repo) {
  let allIssues = [];
  for (let page = 0; ; page++) {
    // console.warn(`fetching page ${page}`);
    let issues = await getIssuesForRepo(repo, page);
    if (issues.length == 0) break;
    allIssues.push(issues);
  }

  // console.warn();
  return allIssues.flat();
}

async function getStargazersForRepo(repo) {
  return apiRequest(`https://api.github.com/repos/${repo}/stargazers`);
}

async function getGithubRepoName(packageName) {
  let {
    repository: { url },
  } = await apiRequest(`https://registry.npmjs.org/${packageName}`);
  return url.match(/https:\/\/github\.com\/(.+?\/.+?)(?:\.git)?$/)[1];
}

async function getCompetitorAnalysis(packageName) {
  let repoName = await getGithubRepoName(packageName);
  let issuesAndPrs = await getAllIssuesForRepo(repoName);
  let issues = [];
  let prs = [];
  for (let i of issuesAndPrs)
    if (i.pull_request) prs.push(i);
    else issues.push(i);

  let issueMetrics = calculateMetrics(issues);
  let prMetrics = calculateMetrics(prs);

  return {
    starCount: await getStargazersForRepo(repoName).then(
      (stargazers) => stargazers.length
    ),
    openIssueCount: issues.length,
    openPrCount: prs.length,
    netIssueReactions: issueMetrics.reactions,
    netPrReactions: prMetrics.reactions,

    topIssueAndPr: {
      mostUpvotedIssue: issueMetrics.mostUpvoted,
      mostUpvotedIssueCount: issueMetrics.mostUpvotedCount,
      mostUpvotedPr: prMetrics.mostUpvoted,
      mostUpvotedPrCount: prMetrics.mostUpvotedCount,
    },
  };
}

function calculateMetrics(issueOrPrs) {
  let totalReactions = {};
  let mostUpvoted = null;
  let mostUpvotedCount = 0;
  for (let { title, number, reactions } of issueOrPrs) {
    for (let reaction in reactions) {
      if (
        reaction == "total_count" ||
        reaction == "url" ||
        reactions[reaction] == 0
      )
        continue;
      if (!(reaction in totalReactions)) totalReactions[reaction] = 0;
      totalReactions[reaction] += reactions[reaction];
    }

    if (mostUpvotedCount < reactions["+1"]) {
      mostUpvotedCount = reactions["+1"];
      mostUpvoted = `[#${number}] ${title}`;
    }
  }
  return {
    mostUpvoted,
    mostUpvotedCount,
    reactions: Object.fromEntries(
      Object.entries(totalReactions).sort(([a], [b]) => a.localeCompare(b))
    ),
  };
}

async function main() {
  let packageName = process.argv[2];
  if (!packageName) {
    console.error(
      `error: expected package name as parameter, got: ${packageName}`
    );
    return;
  }

  console.log(`analyzing package ${packageName}:`);

  let { topIssueAndPr, ...analysis } = await getCompetitorAnalysis("vue");
  console.table(analysis);
  console.table(topIssueAndPr);
}

if (require.main) main();
