
const express = require('express');
const app = express();
const axios = require('axios');
require('dotenv').config();
const PORT = process.env.PORT || 5000;
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
app.get('/api/user/:username',Isvalid, async (req, res)=>{
   const username  = req.params.username
   try {
    const response = await axios.get(`https://api.github.com/users/${username}`);
    res.json(response.data);
} catch (error) {
    res.status(400).json({ message: "Error fetching data" });
}
});
 //repo info
app.get('/api/user/:username/repos', async (req, res)=>{
    const username = req.params.username;
    try {
        const response =  await axios.get(`https://api.github.com/users/${username}/repos`);
        res.json(response.data); 
    }
    catch(error) {
        res.status(400).json({message:"error repositories is not found"});
    } 
});

// issues 
app.get('/api/user/:username/issues', async (req, res)=>{
   const username  = req.params.username;
   try{
    const response = await axios.get( `https://api.github.com/search/issues?q=author:${username}+type:issue`);
    res.send(response.data.items);
   }
   catch(error)
   {
    res.status(400).json({message: "Not yet solved any issues or invalid username" });
   }
});
 // followers
app.get('/api/user/:username/followers', async (req, res) => {
    const username = req.params.username;
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/followers`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: "Error fetching followers" });
    }
});
// following
app.get('/api/user/:username/following', async (req, res) => {
    const username = req.params.username;
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/following`);
        res.json(response.data);
    } catch (error) {
        res.status(400).json({ message: "Error fetching following users" });
    }
});

// pull-requests
app.get('/api/user/:username/pull-requests', async (req,res)=>{
   const username = req.params.username;
   try{
    const response = await axios.get(`https://api.github.com/search/issues?q=author:${username}+is:pr`);
    res.send(response.data.items);
   }
   catch(error)
   {
    res.status(400).json({message:"users not yet created any pull request"});
   }
});
// orgs 
app.get('/api/user/:username/orgs', async(req, res)=>{
    const username  = req.params.username;
    try{
        const response  = await axios.get(`https://api.github.com/users/${username}/orgs`);
        res.send(response.data);
    }
    catch(error)
    {
        res.status(400).json({message : "not found any orgs"});
    }
});
// starred
app.get('/api/user/:username/starred"', async(req, res)=>{
    const username = req.params.username;
    try{
        const response = await axios.get(`https://api.github.com/users/${username}/starred"`);
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