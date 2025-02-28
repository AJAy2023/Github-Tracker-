
const express = require('express');
const app = express();
const axios = require('axios');
const NodeCache = require('node-cache');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const headers = process.env.GITHUB_TOKEN;
app.use(express.json());

// middleware for the username 
const Isvalid = (req, res ,next)=>{
    const username = req.params.username;
  if(!username || !/^[a-zA-Z0-9_]+$/.test(username))
  {
    return res.status(404).json({message: "Invalid user name "});

  }
    next();
};
// username 
app.get('/:username',Isvalid, async (req, res)=>{
   const username  = req.params.username
   try {
    const response = await axios.get(`https://api.github.com/users/${username}`,
    {
        headers : {
            Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept : "application/vnd.github.v3+json",
            "User-Agent" : "Github-tracker"
        }
    });
    res.json(response.data);
} catch (error) {
    res.status(400).json({ message: "Error fetching data" });
}
});
 //repo info
 app.get('/:username/repos', async (req, res) => {
    const username = req.params.username;
    
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`,{
            headers : {
                Authorization : `Bearer ${process.env.GITHUB_TOKEN}`,
                Accept : "application/vnd.github.v3+json",
                "User-Agent" : "Github-tracker"
            }
        });
        res.json(response.data);
    } catch (error) {
        console.error("Error fetching repositories:", error.message);
        res.status(400).json({ message: "Repositories not found or invalid username" });
    }
});


// issues 
app.get('/:username/issues', async (req, res)=>{
   const username  = req.params.username;
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
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: "Error fetching followers" });
    }
});
// following
app.get('/:username/following', async (req, res) => {
    const username = req.params.username;
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
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: "Error fetching following users" });
    }
});

// pull-requests
app.get('/:username/pull-requests', async (req,res)=>{
   const username = req.params.username;
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