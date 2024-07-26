const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const inquirer = require('inquirer');

let modes = ['Asset Grab Mode', 'Regular Mode', 'Reflection Mode']
const questions = [
  {
    type: 'list',
    name: 'mode',
    message: 'How do you want to start Studio-Offline?',
    choices: modes,
  }
]
let assetGrab = false;
let reflection = false;

// fflags & oauth
app.use("/v2/settings/application/PCStudioApp/*", require("./routes/ClientSettings.js"));
app.use("/oauth", require("./routes/OAuth.js"))

/*
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
OTHER
\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\
*/

// the thing that blocked people from playing during october 2021 downtime, codename "GUAC" (G Universal App Configuration)
app.get("/universal-app-configuration/v1/behaviors/studio/content", (req, res) => {
  res.sendFile(__dirname + "/static/UniversalAppConfig/content.json");
})
// needed to not get "[FLog::Error] Error: Operation failed. Please check your network connection and try again. If the error persists, contact Customer Support"
// won't stop you from using studio but will bug you if not implemented
app.get("/universal-app-configuration/v1/behavior-contents", (req, res) => {
  res.sendFile(__dirname + "/static/UniversalAppConfig/behavior-content.json");
})
// same for this API, see above
app.get("/v2/assets/*/details", (req, res) => {
  res.sendFile(__dirname + "/static/Economy/details.json");
})

// logout returns 200 (and nothing) if successfull
app.post("/v2/logout", (req, res) => {
  res.send({});
})

// studio will loop to logout if this api isnt implemented
app.get("/v1/users/authenticated", (req, res) => {
  res.sendFile(__dirname + "/static/Users/authenticated.json")
})

// just the ROBLOX headshot (for esc)
app.get("/headshot", (req, res) => {
  res.sendFile(__dirname + "/static/headshots/default.png")
})
app.get("/renders/places/default.png", (req, res) => {
  res.sendFile(__dirname + "/static/images/places/default.png")
})

// required for the File > New
app.get("/studio-open-place/v1/openplace", (req, res) => {
  res.sendFile(__dirname + "/static/PlaceOpen/openplace.json")
})
app.post("/asset-permissions-api/v1/assets/check-permissions", (req, res) => {
  res.send({ "results": [{ "value": { "status": "NoPermission" } }] })
})

// templates code
app.get("/v1/gametemplates", (req, res) => {
  res.sendFile(__dirname + "/static/GameTemplates/content.json")
})
app.get("/v1/games/icons", (req, res) => {
  res.sendFile(__dirname + "/static/thumbnails/games.json")
})

// asset grabbing (obvious)
app.get("/v1/asset", (req, res) => {
  const id = req.query.id;
  let fileFound = false;
  if (reflection) {
    res.redirect(`https://assetdelivery.roblox.com/v1/asset/?id=${id}&permissionContext=ignoreUniverse&xcachesplit=0`);
  }
  if (assetGrab) {
    axios({
      method: "get",
      url: "https://assetdelivery.roblox.com/v1/asset/?id=" + id + "&permissionContext=ignoreUniverse&xcachesplit=0",
      responseType: "stream",
      headers: {
        'User-Agent': 'RobloxStudio/WinInet'
      }
    }).then(function (response) {
      // progress bar stolen from i-forgot-where
      const filePath = path.join(__dirname, 'static/assets', id);
      const totalLength = parseInt(response.headers['content-length'], 10);
      let downloaded = 0;

      const progressBarWidth = 50;
      process.stdout.write(`Downloading ${filePath}\n`);
      const progressBar = new Array(progressBarWidth).fill(' ');

      response.data.on('data', (chunk) => {
        downloaded += chunk.length;
        const progress = (downloaded / totalLength) * 100;
        const completed = Math.floor(progress / (100 / progressBarWidth));
        progressBar.fill('=', 0, completed);
        const clampedProgress = Math.min(progress, 100);
        process.stdout.clearLine();
        process.stdout.cursorTo(0);
        process.stdout.write(`[${progressBar.join('')}] ${clampedProgress.toFixed(2)}%`);
      });

      response.data.pipe(fs.createWriteStream(filePath));

      response.data.on('end', () => {
        process.stdout.write('\nDownload complete!\n');
      });
    }).catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        res.status(error.response.status).send(error.response.data);
      }
    })
  }

  fs.readdir(`./static/assets/`, (err, files) => {
    files.forEach(file => {
      if (!fileFound && file.split('.')[0] === id) {
        const filePath = path.join(__dirname, 'static/assets', file);
        res.sendFile(filePath);
        fileFound = true;
      }
    });

    if (!fileFound) {
      res.status(404).send();
    }
  });
})

// IsInGroup API (will stall coregui if not implemented)
app.get("/v2/users/*/groups/roles", (req, res) => {
  res.send(JSON.stringify({ "data": [] }))
})

/// TELEMETRY

// Used to send your MAC address to ROBLOX (TELEMETRY)
app.get("/game/validate-machine", (req, res) => {
  res.send(JSON.stringify({ "success": true, "message": "" }))
})
// Just sends info about studio (TELEMETRY)
app.get("/studio/pbe", (req, res) => {
  res.send({})
})
// Used to send statistics on how long something took to load
app.get("/v1.0/SequenceStatistics/BatchAddToSequencesV2", (req, res) => {
  res.send(JSON.stringify({ "Version": "1.1", "Content": { "Headers": [] }, "StatusCode": "OK", "ReasonPhrase": "OK", "Headers": [], "TrailingHeaders": [], "RequestMessage": null, "IsSuccessStatusCode": true }))
})

// Check client version
app.get("/v2/client-version/WindowsStudio64", (req, res) => {
  res.send(JSON.stringify({ "version": "0.635.0.6350588", "clientVersionUpload": "version-258fa44b42074cfc", "bootstrapperVersion": "1, 6, 0, 6350588" }))
})

// Check if you're banned
app.get("/v1/not-approved", (req, res) => {
  res.send(JSON.stringify({}))
})


inquirer.createPromptModule()(questions).then((answers) => {
  if (answers.mode === modes[0]) {
    assetGrab = true;
  } else if (answers.mode === modes[2]) {
    reflection = true;
  }
  app.listen(80, () => {
    console.log(`Webserver is running on mode: ${answers.mode}`);
  });
})