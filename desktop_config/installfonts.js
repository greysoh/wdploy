const { axiod } = await import("https://deno.land/x/axiod/mod.ts");
const firaCodePath = await axiod.get("https://api.github.com/repos/tonsky/FiraCode/releases/latest");

const firaCodeZip = await axiod.request({
    method: 'GET',
    url: firaCodePath.data.assets[0].browser_download_url,
    responseType: 'arraybuffer',
    responseEncoding: 'binary'
});

Console.info("Downloaded FiraCode");
Console.info("Writing zip file...");

const data = new Uint8Array(firaCodeZip.data);

const file = await Deno.create(Deno.env.get("TEMP") + "\\firaCode.zip");
await Deno.writeAll(file, data);

Console.info("Writing installer files...")

await Deno.writeTextFile(Deno.env.get("TEMP") + "\\firaCodeInstaller_stage0.bat", `cd "${Deno.env.get("TEMP")}"
del firaCodeExtract /s /q
mkdir firaCodeExtract
move firaCode.zip firaCodeExtract
cd firaCodeExtract
tar -xf firaCode.zip`);

await Deno.writeTextFile(Deno.env.get("TEMP") + "\\firaCodeInstaller_stage1.bat", `@echo off
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
  echo Invoking UAC...

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


cd "${Deno.env.get("TEMP") + "\\firaCodeExtract\\ttf\\"}"

copy /Y * "%SystemRoot%\\Fonts"
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "FiraCode Bold (TrueType)" /t REG_SZ /d "FiraCode-Bold.ttf" /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "FiraCode Light (TrueType)" /t REG_SZ /d "FiraCode-Light.ttf" /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "FiraCode Medium (TrueType)" /t REG_SZ /d "FiraCode-Medium.ttf" /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "FiraCode Regular (TrueType)" /t REG_SZ /d "FiraCode-Regular.ttf" /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "FiraCode Retina (TrueType)" /t REG_SZ /d "FiraCode-Retina.ttf" /f
reg add "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts" /v "FiraCode SemiBold (TrueType)" /t REG_SZ /d "FiraCode-SemiBold.ttf" /f`);

await WindowsAPI.executeShell(Deno.env.get("TEMP") + "\\firaCodeInstaller_stage0.bat");
await WindowsAPI.executeShell(Deno.env.get("TEMP") + "\\firaCodeInstaller_stage1.bat");

console.info("FiraCode installed");