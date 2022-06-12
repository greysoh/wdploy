import axiod from "https://deno.land/x/axiod/mod.ts";
import { ConsoleLogger } from "https://deno.land/x/unilogger@v1.0.3/mod.ts";

import * as WindowsAPI from "./libs/WindowsAPI.js";
import * as Deployinator from "./libs/Deployinator.js";

async function isAlive(ip) {
  try {
      let data = await axiod({
          method: "get",
          url: ip,
          timeout: 4060
      });

      if (data.data == undefined) {
          return false;
      } else {
          return true;
      }
  } catch (e) {
      return false;
  }
}

const versionInfo = {
  version: "0.2.0"
};

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// Main logger
const log = new ConsoleLogger({
  tag_string: "{name} |",
  tag_string_fns: {
    name: () => "WDeployInit",
  },
});

let json = {};

if (
  Deno.args[0] === "--help" ||
  Deno.args[0] === "-h" ||
  Deno.args[0] == undefined
) {
  if (versionInfo.version.startsWith("0")) {
    console.log("wdeploy Framework {prerelease} v" + versionInfo.version);
  } else {
    console.log("wdeploy Framework v" + versionInfo.version);
  }

  console.log("Usage: wdeploy.exe <deploy JSON path>");
  Deno.exit(1);
} else if (Deno.args[0].startsWith("http")) {
  log.info("Fetching deploy JSON from URL");

  if (!await isAlive(Deno.args[0])) {
    log.error("We can't reach your URL. Please check your internet connection and try again.");
    Deno.exit(0);
  }

  json = await axiod.get(Deno.args[0]);
  json = json.data;

  for (let i in json.path) {
    let path = Deno.args[0];
    path = path.substring(0, path.replaceAll("\\", "/").lastIndexOf("/"));
    json.path[i].rootURL = path;
  }
} else {
  log.info("Fetching deploy JSON");
  let file = "";

  try {
    file = Deno.readTextFileSync(Deno.args[0]);
  } catch (e) {
    log.error("Failed to read deploy JSON");
    Deno.exit(2);
  }

  try {
    json = JSON.parse(file);
  } catch (e) {
    log.error("Failed to parse deploy JSON");
    Deno.exit(2);
  }

  for (let i in json.path) {
    let path = Deno.args[0];
    path = path.substring(0, path.replaceAll("\\", "/").lastIndexOf("/"));
    json.path[i].rootURL = path;
  }
}

let functions = [];

if (json.path == undefined) {
  log.error("JSON file is empty. Exiting...");
  Deno.exit(2);
}

for (let data of json.path) {
  if (data.path === undefined) {
    log.error("Deploy JSON is missing path");
    continue;
  }

  if (data.name == undefined) {
    log.error("Deploy JSON is missing name");
    continue;
  }

  if (data.path.startsWith("http")) {
    log.info(`Fetching ${data.name} from URL`);

    let jsonModified = data;
    const file = await axiod.get(data.path).data;

    jsonModified.func = new AsyncFunction("Console", "WindowsAPI", file);
    functions.push(jsonModified);
  } else {
    log.info(`Fetching ${data.name}`);
    
    let path = data.rootURL + "/" + data.path;

    if (path.startsWith("http")) {
        if (data.path.startsWith("http")) path = data.path;

        if (!await isAlive(path)) {
          log.error(`We can't reach your URL. Please check your internet connection and try again.`);
          continue;
        }

        const JSData = await axiod.get(path);
        let jsonModified = data;

        jsonModified.func = new AsyncFunction("Console", "WindowsAPI", "Deployinator", JSData.data);
        functions.push(jsonModified);
    } else {
        let file = "";
        let jsonModified = data;
    
        try {
          file = Deno.readTextFileSync(path);
        } catch (e) {
          log.error(`Failed to read file ${path}`);
          continue;
        }

        jsonModified.func = new AsyncFunction("Console", "WindowsAPI", "Deployinator", file);
        functions.push(jsonModified);
    }
  }
}

log.info("Starting execution...");

for (let i of functions) {
  log.info("Executing " + i.name);

  const Console = new ConsoleLogger({
    tag_string: "{name} |",
    tag_string_fns: {
      name: () => i.name,
    },
  });

  try {
    await i.func(Console, WindowsAPI, Deployinator);
  } catch (e) {
    log.error("Failed to finish execution of " + i.name);
    log.error(e);
  }
}

Deno.exit(0);