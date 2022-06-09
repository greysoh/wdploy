import axiod from "https://deno.land/x/axiod/mod.ts";
import { ConsoleLogger } from "https://deno.land/x/unilogger@v1.0.3/mod.ts";

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

// Main logger
const log = new ConsoleLogger({
  tag_string: "{name} |",
  tag_string_fns: {
    name: () => "WDeployInit",
  },
});

// API for Windows stuff
const WindowsAPI = {
  /**
   * Executes shell command
   * @param {string} cmd Command you want to run
   * @returns {object} Status of command
   */
  executeShell: async (cmd) => {
    return new Promise(async (resolve, reject) => {
      const p = Deno.run({
        cmd: cmd.split(" "),
      });

      const code = await p.status();

      resolve(code);
    });
  },
  /**
   * Installs winget packages
   * @param {string} Package package list you want to install
   */
  installWingetCMD: async (Package) => {
    const WingetLog = new ConsoleLogger({
      tag_string: "{name} |",
      tag_string_fns: {
        name: () => "Winget",
      },
    });

    WingetLog.debug("Checking if winget is installed...");

    const wingetCheck = await WindowsAPI.executeShell("winget --version");
    console.log("");

    if (!wingetCheck.success) {
      WingetLog.fatal(
        "Winget installation is not supported. Please install VCLibs, UIXaml, and Winget."
      );

      return;
    }

    let packageSplit = Package.split(" ");

    for (let i of packageSplit) {
      WingetLog.info(`Installing ${i}...`);
      let executeStatus = await WindowsAPI.executeShell(`winget install ${i}`);

      if (!executeStatus.success) {
        WingetLog.error(`Winget failed to install ${i}`);
      }
    }
  },
};

let json = {};

if (
  Deno.args[0] === "--help" ||
  Deno.args[0] === "-h" ||
  Deno.args[0] == undefined
) {
  console.log("Usage: wdeploy.exe <deploy JSON path>");
  Deno.exit(1);
} else if (Deno.args[0].startsWith("http")) {
  log.info("Fetching deploy JSON from URL");
  json = await axiod.get(Deno.args[0]);
  json = json.data;

  for (let i in json.path) {
    let path = Deno.args[0];
    path = path.substring(0, path.replaceAll("\\", "/").lastIndexOf("/"));
    json.path[i].rootURL = path;
  }
} else {
  log.info("Fetching deploy JSON");
  json = JSON.parse(await Deno.readTextFile(Deno.args[0]));

  for (let i in json.path) {
    let path = Deno.args[0];
    path = path.substring(0, path.replaceAll("\\", "/").lastIndexOf("/"));
    json.path[i].rootURL = path;
  }
}

let functions = [];

for (let data of json.path) {
  if (data.path === undefined) {
    log.error("Deploy JSON is missing path");
    Deno.exit(1);
  }

  if (data.name == undefined) {
    log.error("Deploy JSON is missing name");
    Deno.exit(1);
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

        const JSData = await axiod.get(path);
        let jsonModified = data;

        jsonModified.func = new AsyncFunction("Console", "WindowsAPI", JSData.data);
        functions.push(jsonModified);
    } else {
        const file = await Deno.readTextFile(path);
        let jsonModified = data;
    
        jsonModified.func = new AsyncFunction("Console", "WindowsAPI", file);
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
    await i.func(Console, WindowsAPI);
  } catch (e) {
    log.error("Failed to finish execution of " + i.name);
    log.error(e);
  }
}
