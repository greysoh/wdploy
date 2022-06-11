const { ConsoleLogger } = await import("https://deno.land/x/unilogger@v1.0.3/mod.ts");

let isShellActive = false;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Executes shell command
 * @param {string} cmd Command you want to run
 * @returns {object} Status of command
 */
export function executeShell(cmd) {
  return new Promise(async (resolve, reject) => {
    while (isShellActive) {
      await sleep(100);
    }
    isShellActive = true;

    let p = {};

    while (true) {
      try {
        p = Deno.run({
          cmd: cmd.split(" "),
        });

        break;
      } catch (e) {}
    }

    const code = await p.status();

    isShellActive = false;
    resolve(code);
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
  await executeShell(Deno.env.get("TEMP") + "\\runBatch.bat");
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

  const wingetCheck = await executeShell("winget --version");
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
    let executeStatus = await executeShell(`winget install ${i}`);

    if (!executeStatus.success) {
      WingetLog.error(`Winget failed to install ${i}`);
    }
  }
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
        
        if (i.path == null && i.value == null && i.type == null) {
            batchScript += `reg add "${i.key}" /f\n`;
        } else if (i.path == null && i.value == null && i.type == "DELETE") {
            batchScript += `reg delete "${i.key}" /f\n`;
        } else if (i.value == null && i.type == "DELETE") {
            batchScript += `reg delete "${i.key}" /v "${i.path}" /f\n`;
        } else {
            batchScript += `reg add "${i.key}" /v "${i.path}" /t ${i.type} /d ${fixString(i.value)} /f\n`;
        }
    }

    const commandOutput = await runBatch(batchScript);
    return commandOutput;
}