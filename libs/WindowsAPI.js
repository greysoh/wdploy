import { ConsoleLogger } from "https://deno.land/x/unilogger@v1.0.3/mod.ts";
import { installWinget } from "./wingetInstaller.js";
import { downloadFile } from "./Deployinator.js";

/**
 * Executes shell command
 * @param {string} cmd Command you want to run
 * @returns {object} Status of command
 */
 export function executeShell(cmd) {
  return new Promise(async (resolve) => {
    const p = Deno.run({
      cmd: typeof cmd == "object" ? cmd : cmd.split(" ")
    });

    const code = await p.status();

    resolve({
      status: code
    });
  });
}

/**
 * Executes shell command, but the stdout and error is piped to you
 * @param {string} cmd Command you want to run
 * @returns {object} Status of command
 */
export function executePipedShell(cmd) {
  return new Promise(async (resolve) => {
    const p = Deno.run({
      cmd: typeof cmd == "object" ? cmd : cmd.split(" "),
      
      stdout: "piped",
      stderr: "piped",
    });

    const rawCode = await p.status();
    
    const rawOutput = await p.output();
    const rawError = await p.stderrOutput();

    resolve({
      status: rawCode,

      stdout: rawOutput,
      stderr: rawError
    });
  });
}

/**
 * Runs string as batch file
 * @param {string} string String to be executed as batch file
 */
export async function runBatch(string) {
  try {
    Deno.removeSync(Deno.env.get("TEMP") + "\\runBatch.bat");
  } catch (e) {
    //
  }

  Deno.writeTextFileSync(Deno.env.get("TEMP") + "\\runBatch.bat", string);
  await executeShell(["cmd.exe", "/c", Deno.env.get("TEMP") + "\\runBatch.bat"]);
}

/**
 * Installs winget packages
 * @param {string} Package package list you want to install
 */
export async function installWingetCMD(Package) {
  const WingetLog = new ConsoleLogger({
    tag_string: "{name} |",
    tag_string_fns: {
      name: () => "Winget",
    },
  });

  WingetLog.debug("Checking if winget is installed...");
  try {
    await executePipedShell("winget --version");
  } catch (e) {
    const prompt = await confirm("Winget is not installed. Do you want to install it?");
      
    if (prompt) {
      WingetLog.debug("Installing winget...");
      WingetLog.debug("Calling installWinget()...");
      await installWinget();
    } else {
      WingetLog.fatal("Winget is not installed. Exiting...");
      return;
    }
  }

  let packageSplit = Package.split(" ");

  for (let i of packageSplit) {
    WingetLog.info(`Installing ${i}...`);
    let executeStatus = await executeShell(`winget install ${i}`);

    if (!executeStatus.code.success) {
      WingetLog.error(`Winget failed to install ${i}`);
    }
  }
}

/**
 * Installs ninite packages, can be used on Windows 7 and above
 * @param {string} opts Ninite packages to install (see ninite.js for a list)
 */
export async function runNinite(opts) {
  const niniteSrc = await import("../src/ninite.js");
  const Console = new ConsoleLogger({
    tag_string: "{name} |",
    tag_string_fns: {
      name: () => "Ninite",
    },
  });

  Console.info("Generating Ninite...");

  let url = "https://ninite.com/";

  let options = opts.split(" ");
  const ninite = niniteSrc.default;

  for (let i of options) {
    const displayNameFind = ninite.find((x) => x.displayName === i);
    const technicalNameFind = ninite.find((x) => x.technicalName === i);

    if (displayNameFind == undefined && technicalNameFind == undefined) {
      Console.error(`${i} is not a valid option.`);
      continue;
    } else {
      let goodFind = {};
      if (displayNameFind != undefined) goodFind = displayNameFind;
      if (technicalNameFind != undefined) goodFind = technicalNameFind;

      url += goodFind.technicalName + "-";
    }
  }

  if (url == "https://ninite.com/") {
    Console.error("No options were selected.");
    return;
  }

  url = url.substring(0, url.length - 1);
  url += "/ninite.exe";

  Console.info("Downloading your Ninite...");
  await downloadFile(url, Deno.env.get("TEMP") + "\\ninite.exe");

  Console.info("Downloaded your Ninite!");
  Console.info("Running your Ninite...");
  await executeShell(Deno.env.get("TEMP") + "\\ninite.exe");
}

/**
 * Invokes UAC prompt
 * @param {string} cmd Command you want to run as Admin
 * @returns {string} Command with UAC injection
 */
export function invokeUAC(cmd) {
  return `@echo off
    :init
     setlocal DisableDelayedExpansion
     set cmdInvoke=1
     set winSysFolder=System32
     set "batchPath=%~dpnx0"
     rem this works also from cmd shell, other than %~0
     for %%k in (%0) do set batchName=%%~nk
     set "vbsGetPrivileges=%temp%\\OEgetPriv_%batchName%.vbs"
     setlocal EnableDelayedExpansion
    
    :checkPrivileges
      NET FILE 1>NUL 2>NUL
      if '%errorlevel%' == '0' ( goto gotPrivileges ) else ( goto getPrivileges )
    
    :getPrivileges
      if '%1'=='ELEV' (echo ELEV & shift /1 & goto gotPrivileges)
    
      ECHO Set UAC = CreateObject^("Shell.Application"^) > "%vbsGetPrivileges%"
      ECHO args = "ELEV " >> "%vbsGetPrivileges%"
      ECHO For Each strArg in WScript.Arguments >> "%vbsGetPrivileges%"
      ECHO args = args ^& strArg ^& " "  >> "%vbsGetPrivileges%"
      ECHO Next >> "%vbsGetPrivileges%"
      
      if '%cmdInvoke%'=='1' goto InvokeCmd 
    
      ECHO UAC.ShellExecute "!batchPath!", args, "", "runas", 1 >> "%vbsGetPrivileges%"
      goto ExecElevation
    
    :InvokeCmd
      ECHO args = "/c """ + "!batchPath!" + """ " + args >> "%vbsGetPrivileges%"
      ECHO UAC.ShellExecute "%SystemRoot%\\%winSysFolder%\\cmd.exe", args, "", "runas", 1 >> "%vbsGetPrivileges%"
    
    :ExecElevation
     "%SystemRoot%\\%winSysFolder%\\WScript.exe" "%vbsGetPrivileges%" %*
     exit /B
    
    :gotPrivileges
     setlocal & cd /d %~dp0
     if '%1'=='ELEV' (del "%vbsGetPrivileges%" 1>nul 2>nul  &  shift /1)
    
    ${cmd}`;
}

/**
 * Runs regedit commands
 * @param {array} array Array of registry commands you want to run.
 * @example [{ "key": "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer", "path": "BackgroundType", "value": "1", "type": "REG_DWORD" }]
 * @returns {JSON} Status of command
 */
export async function runReg(array) {
  let batchScript = invokeUAC(`rem Regedit commands\n\n`);

  for (let i of array) {
    function fixString(value) {
      if (typeof value === "string") {
        return `"${value}"`;
      }

      return value;
    }

    //batchScript += `reg ${i.type == "DELETE" ? "delete" : "add"} "${i.key}" ${}/f\n`;

    if (i.path == null && i.value == null && i.type == null) {
      batchScript += `reg add "${i.key}" /f\n`;
    } else if (i.path == null && i.value == null && i.type == "DELETE") {
      batchScript += `reg delete "${i.key}" /f\n`;
    } else if (i.value == null && i.type == "DELETE") {
      batchScript += `reg delete "${i.key}" /v "${i.path}" /f\n`;
    } else {
      batchScript += `reg add "${i.key}" /v "${i.path}" /t ${
        i.type
      } /d ${fixString(i.value)} /f\n`;
    }
  }

  const commandOutput = await runBatch(batchScript);
  return commandOutput;
}