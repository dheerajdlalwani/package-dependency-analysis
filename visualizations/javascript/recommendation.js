const fetch = require("node-fetch");
const { calculateTfIdf } = require("ts-tfidf");

async function apiRequest(url, options = {}) {
  return fetch(url, options).then((r) => r.json());
}

async function getIssuesForRepo(repo, page = 1) {
  return apiRequest(
    `https://api.github.com/repos/${repo}/issues?page=${page}&per_page=100`,
    {
      headers: {
        accept: "application/vnd.github.text+json",
      },
    }
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

async function getRecommendations(packageName) {
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

    issueMetrics,
    prMetrics,
    netIssueReactions: issueMetrics.reactions,
    netPrReactions: prMetrics.reactions,
  };
}

function calculateMetrics(issueOrPrs) {
  let totalReactions = {};

  let mostUpvoted = null;
  let mostUpvotedCount = 0;

  let mostDownvoted = null;
  let mostDownvotedCount = -1;

  let totalOpenTime = 0;
  let maxOpenTimeTitle = null;
  let maxOpenTime = 0;

  let now = new Date().getTime();
  for (let { title, number, reactions, created_at } of issueOrPrs) {
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
    if (mostDownvotedCount < reactions["-1"]) {
      mostDownvotedCount = reactions["-1"];
      mostDownvoted = `[#${number}] ${title}`;
    }

    let openTime = now - new Date(created_at).getTime();
    totalOpenTime += openTime;
    if (maxOpenTime < totalOpenTime) {
      maxOpenTime = openTime;
      maxOpenTimeTitle = `[#${number}] ${title}`;
    }
  }

  let allScores = calculateTfIdf({
    texts: issueOrPrs.map(({ body_text }) => body_text),
  });
  let corpusScores = new Map();
  for (let documentScores of allScores)
    for (let [term, score] of documentScores)
      if (term.length > 0)
        corpusScores.set(term, (corpusScores.get(term) ?? 0) + score);

  let maxOpenDays = Math.floor(maxOpenTime / (1000 * 60 * 60 * 24));
  let averageOpenTimeDays = Math.floor(
    totalOpenTime / (1000 * 60 * 60 * 24 * issueOrPrs.length)
  );

  return {
    mostUpvoted: `(${mostUpvotedCount} times) ${mostUpvoted}`,
    mostDownvoted: `(${mostDownvotedCount} times) ${mostDownvoted}`,

    maxOpenTimeTitle: `(${maxOpenDays} days) ${maxOpenTimeTitle}`,
    averageOpenTime: `${averageOpenTimeDays} days`,

    reactions: Object.fromEntries(
      Object.entries(totalReactions).sort(([a], [b]) => a.localeCompare(b))
    ),
    keywords: Array.from(corpusScores.entries()).sort(([, a], [, b]) => b - a),
  };
}

async function main() {
  let { issueMetrics, prMetrics, ...analysis } = await getRecommendations(
    "vue"
  );
  console.table(analysis);
  console.log();

  console.log("top 10 keywords in issues:");
  console.table(issueMetrics.keywords.slice(0, 10));
  console.log();

  console.log("top 10 keywords in prs:");
  console.table(prMetrics.keywords.slice(0, 10));
  console.log();
  console.log();

  console.log("most upvoted:");
  console.log("  issue:");
  console.log("    " + issueMetrics.mostUpvoted);
  console.log("  pr:");
  console.log("    " + prMetrics.mostUpvoted);
  console.log();
  console.log();

  console.log("most downvoted:");
  console.log("  issue:");
  console.log("    " + issueMetrics.mostDownvoted);
  console.log("  pr:");
  console.log("    " + prMetrics.mostDownvoted);
  console.log();
  console.log();

  console.log("time:");
  console.log("  issue:");
  console.log("    longest open:");
  console.log("    " + issueMetrics.maxOpenTimeTitle);
  console.log("    average time open: " + issueMetrics.averageOpenTime);
  console.log("  pr:");
  console.log("    longest open:");
  console.log("    " + prMetrics.maxOpenTimeTitle);
  console.log("    average time open: " + prMetrics.averageOpenTime);
}

if (require.main) main();
