const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(__dirname+"/build"));

// Apply routes
app.get("/today", async (req, res, next) => {
  try {
    const date = new Date();
    const y = date.getFullYear();
    const m = date.getMonth() + 1;
    const d = date.getDate();
    const resp = await axios.get(
      `https://www.nytimes.com/svc/wordle/v2/${y}-${m < 10 ? "0" : ""}${m}-${d < 10 ? "0" : ""}${d}.json`
    )
    return res.json(resp.data)
  } catch {
    return res.status(500).json({error:"Unable to retrieve word from Wordle Server."})
  }
});
app.get('*', (req, res, next) => 
  res.sendFile('index.html', (e) => next(e))
)

app.listen(PORT, (error) => {
  if (!error) console.log("Server is Successfully Running, and App is listening on port "+ PORT)
  else console.log("Error occurred, server can't start", error);
});