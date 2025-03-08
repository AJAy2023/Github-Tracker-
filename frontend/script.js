document.getElementById("fetchData").addEventListener("click", async () => {
    const input = document.getElementById("username").value.trim();
    const output = document.getElementById("output");

    if (!input) {
        output.innerHTML = "<p class='error'>❌ Please enter a GitHub username.</p>";
        return;
    }

    output.innerHTML = "<p class='loading'>⏳ Loading...</p>";

    if (input.includes("/")) {
        // Case 1: Fetch specific category (username/category)
        await fetchGitHubData(input);
    } else {
        // Case 2: Fetch all categories (username only)
        await fetchAllGitHubData(input);
    }
});

async function fetchGitHubData(endpoint) {
    const output = document.getElementById("output");
    output.innerHTML = "<p class='loading'>⏳ Fetching data...</p>";

    try {
        const apiUrl = `https://github-tracker-kc5r.onrender.com/${endpoint}`;
        const response = await fetch(apiUrl);

        if (!response.ok) throw new Error("❌ Data not found!");

        const data = await response.json();
        output.innerHTML = formatData(endpoint.split("/").pop(), data);
    } catch (error) {
        output.innerHTML = `<p class='error'>${error.message}</p>`;
    }
}

async function fetchAllGitHubData(username) {
    const output = document.getElementById("output");
    output.innerHTML = "<p class='loading'>⏳ Fetching all data...</p>";

    const categories = ["repos", "issues", "pull-requests", "followers", "following", "orgs", "starred"];
    let results = "";

    for (const category of categories) {
        try {
            const apiUrl = `https://github-tracker-kc5r.onrender.com/${username}/${category}`;
            const response = await fetch(apiUrl);

            if (!response.ok) continue;

            const data = await response.json();
            results += formatData(category, data);
        } catch (error) {
            results += `<p class='error'>❌ Error fetching ${category}</p>`;
        }
    }

    output.innerHTML = results || "<p class='info'>📌 No data available.</p>";
}

function formatData(category, data) {
    let outputHTML = `<h3 class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</h3><ul>`;

    if (!data || data.length === 0) {
        return `<p class="info">No ${category} data available.</p>`;
    }

    data.forEach(item => {
        if (category === "repos" || category === "starred") {
            outputHTML += `<li class="card">
                <a href="${item.html_url}" target="_blank">${item.name}</a>
            </li>`;
        } else if (category === "issues" || category === "pull-requests") {
            outputHTML += `<li class="card">
                <a href="${item.html_url}" target="_blank">${item.title}</a> 
                <span class="info"> (Status: ${item.state})</span>
            </li>`;
        } else if (category === "followers" || category === "following") {
            outputHTML += `<li class="card">
                <img src="${item.avatar_url}" class="avatar">
                <a href="https://github.com/${item.login}" target="_blank">${item.login}</a>
            </li>`;
        } else if (category === "orgs") {
            outputHTML += `<li class="card">
                <a href="${item.url}" target="_blank">${item.login}</a>
            </li>`;
        }
    });

    outputHTML += "</ul>";
    return outputHTML;
}


function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
