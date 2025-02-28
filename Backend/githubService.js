const axios = require('axios');
require('dotenv').config();

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const headers = GITHUB_TOKEN ? { Authorization: `token ${GITHUB_TOKEN}` } : {};

const fetchGitHubData = async (url) => {
    try {
        const response = await axios.get(url, { headers });
        return response.data;
    } catch (error) {
        console.error(`Error fetching data from ${url}:`, error.message);
        throw new Error("GitHub API request failed");
    }
};

module.exports = fetchGitHubData;


