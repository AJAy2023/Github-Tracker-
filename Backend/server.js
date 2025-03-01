
const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config(); 
const PORT = process.env.PORT || 5000;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
    console.error(" GITHUB_TOKEN is missing! Add it to your .env file.");
    process.exit(1);
}

// cache setup
const NodeCache = require('node-cache');
const cache = new NodeCache({stdTTL: 3600});


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
app.get('/:username/issues', async (req, res)=>{
   const username  = req.params.username;
   const cacheKey = `issues-${username}`;
   const cachedata = cache.get(cacheKey);
   if(cachedata)
   {
    return res.json(cachedata)
   }
   try{
    const response = await axios.get( `https://api.github.com/search/issues?q=author:${username}+type:issue`,
        {
            headers : {
                Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept : "application/vnd.github.v3+json",
                "User-Agent" : "Github-tracker"
            }
        }
    );
    cache.set(cacheKey, response.data);
    res.send(response.data.items);
   }
   catch(error)
   {
    res.status(400).json({message: "Not yet solved any issues or invalid username" });
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
app.get('/:username/pull-requests', async (req,res)=>{
   const username = req.params.username;
   const cacheKey = `pull-requests-${username}`;
   const cachedata = cache.get(cacheKey);
   if(cachedata)
   {
    return res.json(cachedata)
   }
   try{
    const response = await axios.get(`https://api.github.com/search/issues?q=author:${username}+is:pr`,
        {
            headers : {
                Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept : "application/vnd.github.v3+json",
                "User-Agent" : "Github-tracker"
            }
        }
    );
    cache.set(cacheKey, response.data);
    res.send(response.data.items);
   }
   catch(error)
   {
    res.status(400).json({message:"users not yet created any pull request"});
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