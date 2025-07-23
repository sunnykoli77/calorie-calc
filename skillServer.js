import {createServer} from "node:http";
import serveStatic from "serve-static";
import fs from "fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const talksFile = path.join(__dirname, "talks.json");

async function loadTalks() {
  try {
    return JSON.parse(await fs.readFile(talksFile, "utf8"));
  } catch (e) {
    return {};
  }
}

async function saveTalks(talks) {
  await fs.writeFile(talksFile, JSON.stringify(talks, null, 2));
}

function notFound(request, response) {
  response.writeHead(404, "Not found");
  response.end("<h1>Not found</h1>");
}

class SkillShareServer {
  constructor(talks) {
    this.talks = talks;
    this.version = 0;
    this.waiting = [];

    let fileServer = serveStatic("./public");
    this.server = createServer((request, response) => {
      serveFromRouter(this, request, response, () => {
        fileServer(request, response,
                   () => notFound(request, response));
      });
    });
  }
  start(port) {
    this.server.listen(port);
  }
  stop() {
    this.server.close();
  }
}


import {Router} from "./router.js";

const router = new Router();
const defaultHeaders = {"Content-Type": "text/plain"};

async function serveFromRouter(server, request,
                               response, next) {
  let resolved = await router.resolve(request, server)
    .catch(error => {
      if (error.status != null) return error;
      return {body: String(error), status: 500};
    });
  if (!resolved) return next();
  let {body, status = 200, headers = defaultHeaders} =
    await resolved;
  response.writeHead(status, headers);
  response.end(body);
}

const talkPath = /^\/talks\/([^\/]+)$/;

router.add("GET", /^\/favicon\.ico$/, async (server, request) => {
  return { status: 204 };
});

router.add("POST", talkPath, async (server, title, request) => {
  let talk;
  try {
    talk = await readJSON(request);
  } catch (e) {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Invalid JSON"};
  }

  if (Object.hasOwn(server.talks, title) && (server.talks[title].password == talk.pass)) {
    return {status: 204};
  } else {
    return {status: 401, body: "Incorrect Username and/or Password"};
  }
});

router.add("POST", /^\/talks\/([^\/]+)\/profile$/, async (server, title, request) => {
  let postTalk;
  try {
    postTalk = await readJSON(request);
  } catch (e) {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Invalid JSON"};
  }

  if (!postTalk || typeof postTalk.bodyWeight !== "number" || typeof postTalk.maintainGainLose !== "number" || typeof postTalk.lifeStyle !== "number"
    || typeof postTalk.weightTrainingMinutes !== "number" || typeof postTalk.lowCardioMinutes !== "number" || typeof postTalk.highCardioMinutes !== "number") {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Missing or invalid value"};
  }

  for (const key in postTalk) {
    if (postTalk.hasOwnProperty(key)) {
      server.talks[title][key] = postTalk[key];
    }
  };
  
  const { bodyWeight, maintainGainLose, lifeStyle, weightTrainingMinutes, lowCardioMinutes, highCardioMinutes} = server.talks[title];
  if ((weightTrainingMinutes + lowCardioMinutes + highCardioMinutes) == 0) {
    server.talks[title].calorie = (bodyWeight * maintainGainLose) + (bodyWeight * lifeStyle);
  } else if (highCardioMinutes == 0) {
    server.talks[title].calorie = (bodyWeight * maintainGainLose) + (bodyWeight * lifeStyle) + (((weightTrainingMinutes + lowCardioMinutes) * 10) + (highCardioMinutes * 12));
  } else if (lowCardioMinutes == 0) {
    server.talks[title].calorie = (bodyWeight * maintainGainLose) + (bodyWeight * lifeStyle) + (((weightTrainingMinutes + lowCardioMinutes) * 10) + (highCardioMinutes * 12));
  }

  await saveTalks(server.talks);
  server.updated();
  return {
    body: JSON.stringify({calorie: server.talks[title].calorie}),
    status: 201, 
    headers: {"Content-Type": "application/json"}
  }
});

router.add("POST", /^\/talks\/([^\/]+)\/macros$/, async (server, title, request) => {
  let postMacros;
  try {
    postMacros = await readJSON(request);
  } catch (e) {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Invalid JSON"};
  }

  if (!postMacros || (postMacros.itemCarbHand && typeof postMacros.itemCarbHand !== "string") || (postMacros.amountCarbHand && typeof postMacros.amountCarbHand !== "number") || (postMacros.quantityCarbHand && typeof postMacros.quantityCarbHand !== "number") 
    || (postMacros.itemProtHand && typeof postMacros.itemProtHand !== "string") || (postMacros.amountProtHand && typeof postMacros.amountProtHand !== "number") || (postMacros.quantityProtHand && typeof postMacros.quantityProtHand !== "number") 
  || (postMacros.itemFatsHand && typeof postMacros.itemFatsHand !== "string") || (postMacros.amountFatsHand && typeof postMacros.amountFatsHand !== "number") || (postMacros.quantityFatsHand && typeof postMacros.quantityFatsHand !== "number")) {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Bad/Invalid Macros Data"};
  } else if (Object.hasOwn(server.talks, title)) {

    const userTalk = server.talks[title];

    function updateOrInsert(array, food, nutInHand, quantityInHand) {
      const existingIndex = array.findIndex(entry => entry.food === food);
      const newEntry = {
        food,
        nutInHand,
        quantityInHand,
        nutPerHundred: (nutInHand * 100) / quantityInHand
      };

      if (existingIndex >= 0) {
        array[existingIndex] = newEntry;
      } else {
        array.push(newEntry);
      }
    }

    if (postMacros.quantityCarbHand) {
      updateOrInsert(userTalk.carbohydrates, postMacros.itemCarbHand, postMacros.amountCarbHand, postMacros.quantityCarbHand);
    } else if (postMacros.quantityProtHand) {
      updateOrInsert(userTalk.proteins, postMacros.itemProtHand, postMacros.amountProtHand, postMacros.quantityProtHand);
    } else if (postMacros.quantityFatsHand) {
      updateOrInsert(userTalk.fats, postMacros.itemFatsHand, postMacros.amountFatsHand, postMacros.quantityFatsHand);
    }
    await saveTalks(server.talks);
    server.updated();
    return {status: 204};
  } else {
    return {status: 404, body: `No username:'${title}' found`};
  }
});

import {json as readJSON} from "node:stream/consumers";

router.add("PUT", talkPath, async (server, title, request) => {
  let talk;
  try {
    talk = await readJSON(request);
  } catch (e) {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Invalid JSON"};
  }

  if (!talk || typeof talk.password !== "string") {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Bad talk data"};
  }

  if (server.talks[title]) {
    return {status: 409, headers: {"Content-Type": "text/plain"}, body: "User already exists"};
  }

  server.talks[title] = {
    title,
    password: talk.password,
    carbohydrates: [],
    proteins: [],
    fats: []
  };
  saveTalks(server.talks);
  server.updated();
  return {status: 201, headers: {"Content-Type": "text/plain"}, body: "User registered"};
});

router.add("POST", /^\/talks\/([^\/]+)\/keyword$/, async (server, title, request) => {
  let word;
  try {
    word = await readJSON(request);
  } catch (e) {
    return {status: 400, headers: {"Content-Type": "text/plain"}, body: "Invalid JSON"};
  }

  let match = [], protCatch = [], fatsCatch = [];

  if (server.talks[title].carbohydrates.length > 0) match = server.talks[title].carbohydrates.filter(entry => entry.food.startsWith(word.keyWord));
  if (server.talks[title].proteins.length > 0) protCatch = server.talks[title].proteins.filter(entry => entry.food.startsWith(word.keyWord));
  if (server.talks[title].fats.length > 0) fatsCatch = server.talks[title].fats.filter(entry => entry.food.startsWith(word.keyWord));

  return {headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      match,
      protCatch,
      fatsCatch
    })
  };
});



SkillShareServer.prototype.talkResponse = function() {
  let talks = Object.keys(this.talks)
    .map(title => this.talks[title]);
  return {
    body: JSON.stringify(talks),
    headers: {"Content-Type": "application/json",
              "ETag": `"${this.version}"`,
              "Cache-Control": "no-store"}
  };
};


router.add("GET", /^\/talks$/, async (server, request) => {
  let tag = /"(.*)"/.exec(request.headers["if-none-match"]);
  let wait = /\bwait=(\d+)/.exec(request.headers["prefer"]);
  if (!tag || tag[1] != server.version) {
    return server.talkResponse();
  } else if (!wait) {
    return {status: 304};
  } else {
    return server.waitForChanges(Number(wait[1]));
  }
});

SkillShareServer.prototype.updated = function() {
  this.version++;
  let response = this.talkResponse();
  this.waiting.forEach(resolve => resolve(response));
  this.waiting = [];
};

SkillShareServer.prototype.waitForChanges = function(time) {
  return new Promise(resolve => {
    this.waiting.push(resolve);
    setTimeout(() => {
      if (!this.waiting.includes(resolve)) return;
      this.waiting = this.waiting.filter(r => r != resolve);
      resolve({status: 304});
    }, time * 1000);
  });
};

const port = 8000;
(async () => {
  const talks = await loadTalks();
  const skillShareServer = new SkillShareServer(talks);
  skillShareServer.start(port);
  console.log(`Listening on port ${port}`);
})();

