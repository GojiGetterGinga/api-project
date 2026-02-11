const express = require("express");
const axios = require("axios");
const bodyParser = require ("body-parser");

const favicon = require('serve-favicon');
const path = require('path');

const app = express();
const port = 3000;
const API_URL = "https://wilds.mhdb.io/en/";

// css and images
app.use(express.static("public"));
app.use(favicon(__dirname + '/public/favicon.ico'));


app.use(bodyParser.urlencoded({ extended: true }));

// these values eventually change, dont know if im actually gonna update this site probably not
let maxLocations = 4;
let maxMonsters = 34;
let maxSpecies = 12;
// maxArmorsets

let speciesList = ["construct","flying-wyvern", "temnoceran", "leviathan", "fanged-beast",
  "cephalopod", "bird-wyvern", "brute-wyvern", "amphibian", "demi-elder", "machine", "elder-dragon"];

  // change everything to use location.name instead
let locationList = ["n/a", "Oilwell Basin", "Windward Plains", "Scarlet Forest", "Ruins of Wyveria", "Iceshard Cliffs"]

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

// locations for now, eventually move this once everything is on its own page
app.get("/", async(req, res) => {
    try {
    // for( let i = 0; i< result.camps.length; i++) {
    //   console.log(result.camps[i].name)
    // }

    // console.log( "Use of")
    // for ( let item of result.camps) {
    //   console.log( item.name)
    // }

    // console.log( "Use forEach - recommended")
    // result.camps.forEach( (item) => console.log( item.name));

    // console.log( "Use forEach plus destructuring - recommended")
    // result.camps.forEach( ({name}) => console.log( name));


    // res.render("index.ejs", { content: JSON.stringify(result, null, 2)});
    // res.render("index.ejs", { area: result.name, zones: result.zoneCount, zoneCamps: camps});
    res.render("index.ejs");
    } catch (error) {
      console.error("Failed to make request:", error.message);
      res.render("index.ejs", {
        error: error.message,
      });
    }
});

// eventually rewrite so that it's all locations isntead of random do cards etc
app.get("/locations", async(req, res) => {
  let random = getRandomInt(maxLocations) + 1;
  // console.log(API_URL + "locations/camps?q={\"location.id\":" + random + "}");
  console.log("id: " + req.body.id);
  console.log("danger: " + req.body.risk);
  const searchId = req.body.id;
  const riskLevel = req.body.risk;
  // default, random location all camps
  let url = API_URL + "locations/camps?q={\"location.id\":" + random + "}";

  try {
    const response = await axios.get(url);
    const result = response.data;
    console.log("JSON Result");
    console.log(result);
    console.log("result.name: " + result[0].location.name);
    let locName = result[0].location.name;
    console.log("result.zoneC: " + result[0].location.zoneCount);
    let varZoneCount = result[0].location.zoneCount;

    res.render("locations.ejs", { data: result, zoneName: locName, zoneCount: varZoneCount});
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("locations.ejs", {
      error: error.message,
    });
  }
});

app.post("/get-location", async (req, res) => {
  let random = getRandomInt(maxLocations) + 1;

  console.log("id: " + req.body.id);
  console.log("danger: " + req.body.risk);
  const searchId = req.body.id;
  const riskLevel = req.body.risk;
  console.log("id length: " + searchId.length + ", risk length: " + riskLevel.length);

  let url = API_URL + "locations/camps?q={\"location.id\":" + random + "}";

  if (searchId.length < 1 && riskLevel.length < 1)
    res.redirect("/locations");

  else if(searchId.length >= 1 && riskLevel.length < 1)
    url = API_URL + "locations/camps?q={\"location.id\":" + searchId + "}";
  
  // random location, chosen risk level
  else if(searchId.length < 1 && riskLevel.length >= 1)
    url = API_URL + "locations/camps?q={\"risk\": \"" + riskLevel + "\",\"location.id\":" + random + "}";
  
  // selected location and risk
  else 
    url = API_URL + "locations/camps?q={\"risk\": \"" + riskLevel + "\",\"location.id\":" + searchId + "}";
  
  try {
    console.log(url);
    const response = await axios.get(url);
    const result = response.data;
    // console.log("JSON Result");
    // console.log(result);
    console.log("result.name: " + result[0].location.name);
    let locName = result[0].location.name;
    console.log("result.zoneC: " + result[0].location.zoneCount);
    let varZoneCount = result[0].location.zoneCount;

    res.render("locations.ejs", { data: result, zoneName: locName, zoneCount: varZoneCount});
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("locations.ejs", {
      error: error.message + "; <br/> Iceshard Cliffs has no insecure camps!",
    });
  }
});


app.get("/monsters", async(req, res) => {
  // default, all monsters
  let url = API_URL + "monsters";
  console.log(url);
  try {
    const response = await axios.get(url);
    const result = response.data;
    // console.log("JSON Result");
    // console.log(result);
    res.render("monsters.ejs", { data: result});
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("monsters.ejs", {
      error: error.message,
    });
  }
});




  // maybe add another button that generates single random -> different post
  // let random = getRandomInt(maxMonsters) + 1;
app.post("/get-monster", async (req, res) => {
  let randLocation = getRandomInt(maxLocations) + 1;
  let randSpecies = speciesList[getRandomInt(maxSpecies)];


  console.log("location id: " + req.body.id);
  console.log("species: " + req.body.species);
  let searchId = req.body.id;
  let species = req.body.species;
  // console.log("id length: " + searchId.length + ", risk length: " + species.length);

  let url = API_URL + "monsters";
  // random monster
  if (searchId.length < 1 && species.length < 1)
  {
    url = API_URL + "monsters/?q={\"species\": \"" + randSpecies + "\",\"locations.id\":" + randLocation + "}";
    searchId = randLocation;
    species = randSpecies;
  }

  // filtered location
  else if(searchId.length >= 1 && species.length < 1)
    url = API_URL + "monsters/?q={\"locations.id\":" + searchId + "}";

  // filtered species
  else if(searchId.length < 1 && species.length >= 1)
    url = API_URL + "monsters/?q={\"species\": \"" + species + "\"}";
  
  // both filters
  else 
    url = API_URL + "monsters/?q={\"species\": \"" + species + "\",\"locations.id\":" + searchId + "}";
  
  try {
    console.log(url);
    const response = await axios.get(url);
    const result = response.data;
    // console.log("JSON Result");
    // console.log(result);
    // console.log(result.length);
    res.render("monsters.ejs", { data: result, location: locationList[searchId], species: species, id: searchId});
  } catch (error) {
    console.error("Failed to make request:", error.message);
    res.render("monsters.ejs", {
      error: error.message,
    });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
