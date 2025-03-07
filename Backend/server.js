
const express = require('express');
const cors = require('cors');
const app = express();
const axios = require('axios');
require('dotenv').config({ path: 'E:\\Projects\\github-Tracker\\Github-Tracker-\\Backend\\.env' });
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const PORT = process.env.PORT || 5000;


if (!GITHUB_TOKEN) {
    console.error(" GITHUB_TOKEN is missing! Add it to your .env file.");
    process.exit(1);
}

//  Enable CORS for Specific Origins
const allowedOrigins = [
    "chrome-extension://hfaaphgdjehnaiglhgfbnceebiiogpep",
    "http://127.0.0.1:5500",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS policy does not allow this origin!"));
}
}
}));




// cache setup
const NodeCache = require('node-cache');
const cache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });
    


app.use(express.json());

// middleware for the username 
const Isvalid = (req, res ,next)=>{
    const username = req.params.username;
    if (!username || !/^[a-zA-Z0-9_-]+$/.test(username))
  {
    return res.status(404).json({message: "Invalid username "});

  }
    next();
};
// username 
app.get("/:username", Isvalid, async (req, res) => {
    try {
        const username = req.params.username.trim();
        const cacheKey = `username-${username}`;
        
        //  Step 1: Check if data exists in cache
        const cachedata = cache.get(cacheKey);
        if (cachedata) {
            
            return res.json(cachedata);
        }
 
        console.log(" Fetching from API...");
 
        // Step 2: Fetch data from GitHub API
        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept: "application/vnd.github.v3+json",
                "User-Agent": "Github-tracker"
            }
        });
 
        //  Step 3: Store fetched data in cache
        cache.set(cacheKey, response.data);
        console.log("Data stored in cache!");
 
        //  Step 4: Send response
        res.json(response.data);
 
    } catch (error) {
        console.error("Error fetching repositories:", error);
        
        // Handle 404 (user not found)
        if (error.response && error.response.status === 404) {
            return res.status(404).json({ message: "User not found" });
        }
 
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
 });
 //repo info
 app.get('/:username/repos', async (req, res) => {
    const username = req.params.username;
    const cacheKey = `repos-${username}`;
    const cachedata = cache.get(cacheKey)
    if(cachedata)
    {
        return res.json(cachedata)
    }
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`,{
            headers : {
                Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept : "application/vnd.github.v3+json",
                "User-Agent" : "Github-tracker"
            }
        });
        cache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching repositories:", error.message);
        res.status(400).json({ message: "Repositories not found ||  check the username and request" });
    }
});


// issues 
app.get('/:username/issues', async (req, res) => {
    const username = req.params.username;
    const cacheKey = `issues-${username}`;
    const cacheData = cache.get(cacheKey);

    if (cacheData) {
        return res.json(cacheData);
    }

    try {
        const response = await axios.get(
            `https://api.github.com/search/issues?q=author:${username}+is:issue`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "Github-tracker"
                }
            }
        );

        const issues = response.data.items || [];

        // Cache the data with an expiration time (e.g., 10 minutes)
        cache.set(cacheKey, issues, 600);

        if (issues.length === 0) {
            return res.json({ message: "No issues found for this user." });
        }

        res.json(issues);
    } catch (error) {
        console.error("Error fetching issues:", error.message);
        res.status(500).json({ message: "Error fetching issues from GitHub." });
    }
});

 // followers
app.get('/:username/followers', async (req, res) => {
    const username = req.params.username;
    const cacheKey = `followers-${username}`;
     const cachedata = cache.get(cacheKey)
     if(cachedata)
     {
        return res.json(cachedata);
     }
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/followers`,
            {
                headers : {
                    Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept : "application/vnd.github.v3+json",
                    "User-Agent" : "Github-tracker"
                }
            }
        );
        cache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: "Error fetching followers" });
    }
});
// following
app.get('/:username/following', async (req, res) => {
    const username = req.params.username;
    const cacheKey = `following-${username}`;
    const cachedata = cache.get(cacheKey);
    if(cachedata)
    {
        return res.json(cachedata)
    }
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/following`,
            {
                headers : {
                    Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept : "application/vnd.github.v3+json",
                    "User-Agent" : "Github-tracker"
                }
            }
        );
        cache.set(cacheKey, response.data);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: "Error fetching following users" });
    }
});

// pull-requests
app.get('/:username/pull-requests', async (req, res) => {
    const username = req.params.username;
    const cacheKey = `pull-requests-${username}`;
    const cacheData = cache.get(cacheKey);

    if (cacheData) {
        return res.json(cacheData);
    }

    try {
        const response = await axios.get(
            `https://api.github.com/search/issues?q=author:${username}+is:pr`,
            {
                headers: {
                    Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                    "User-Agent": "Github-tracker"
                }
            }
        );

        const pullRequests = response.data.items || [];

    
        cache.set(cacheKey, pullRequests, 600);

        if (pullRequests.length === 0) {
            return res.json({ message: "No pull requests found for this user." });
        }

        res.json(pullRequests);
    } catch (error) {
        console.error("Error fetching pull requests:", error.message);
        res.status(500).json({ message: "Error fetching pull requests from GitHub." });
    }
});

// orgs 
app.get('/:username/orgs', async(req, res)=>{
    const username  = req.params.username;
    const cacheKey = `orgs-${username}`;
    const cachedata =  cache.get(cacheKey);
    if(cachedata)
    {
        return res.json(cachedata);
    }
    try{
        const response  = await axios.get(`https://api.github.com/users/${username}/orgs`,
            {
                headers : {
                    Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept : "application/vnd.github.v3+json",
                    "User-Agent" : "Github-tracker"
                }
            }
        );
        cache.set(cacheKey, response.data);
        res.send(response.data);
    }
    catch(error)
    {
        res.status(400).json({message : "not found any orgs"});
    }
});
// starred
app.get('/:username/starred', async(req, res)=>{
    const username = req.params.username;
    const cacheKey = `starred-${username}`;
    const cachedata = cache.get(cacheKey);
    if(cachedata)
    {
        return res.json(cachedata)
    }
    try{
        const response = await axios.get(`https://api.github.com/users/${username}/starred`,
            {
                headers : {
                    Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                    Accept : "application/vnd.github.v3+json",
                    "User-Agent" : "Github-tracker"
                }
            }
        );
        cache.set(cacheKey, response.data);
        res.send(response.data);
    }
    catch(error)
    {
    res.status(400).json({message:"user not found"})
    }
});

app.get('/',(req, res)=>{
    res.send("welcome to home page...!!");
})



app.listen(PORT , ()=>{
    console.log(`server is running ${PORT}`);
})