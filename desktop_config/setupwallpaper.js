await Deno.writeTextFile(Deno.env.get("TEMP") + "\\firaCodeInstaller_stage0.bat", `cd "${Deno.env.get("TEMP")}"
del firaCodeExtract /s /q
mkdir firaCodeExtract
move firaCode.zip firaCodeExtract
cd firaCodeExtract
tar -xf firaCode.zip`);

await Deno.writeTextFile(Deno.env.get("TEMP") + "\\installWallpaper.bat", `@echo off
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
 reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers" /v BackgroundType /t REG_DWORD /d 1 /f
 reg add "HKEY_CURRENT_USER\\Control Panel\\Desktop" /v WallPaper /t REG_SZ /d " " /f
 reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"
 reg add "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer" /v NoDesktop /t REG_DWORD /d 1 /f
 reg add "HKEY_CURRENT_USER\\Control Panel\\Colors" /v Background /t REG_SZ /d "0 0 0" /f
`);

await WindowsAPI.executeShell(Deno.env.get("TEMP") + "\\installWallpaper.bat");
Console.info("Please reboot.")