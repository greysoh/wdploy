const { axiod } = await import("https://deno.land/x/axiod/mod.ts");
const firaCodePath = await axiod.get("https://api.github.com/repos/tonsky/FiraCode/releases/latest");

await Deployinator.downloadFile(firaCodePath.data.assets[0].browser_download_url, Deno.env.get("TEMP") + "\\firaCode.zip");

Console.info("Downloaded FiraCode");
Console.info("Writing installer files...")

await WindowsAPI.runBatch(WindowsAPI.invokeUAC(`cd "${Deno.env.get("TEMP")}"
del firaCodeExtract /s /q
mkdir firaCodeExtract
move firaCode.zip firaCodeExtract
cd firaCodeExtract
tar -xf firaCode.zip
cd "${Deno.env.get("TEMP") + "\\firaCodeExtract\\ttf\\"}"
copy /Y * "%SystemRoot%\\Fonts"`));

await WindowsAPI.runReg([
  { "key": "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts", "path": "FiraCode Bold (TrueType)", "value": "FiraCode-Bold.ttf", "type": "REG_SZ" },
  { "key": "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts", "path": "FiraCode Light (TrueType)", "value": "FiraCode-Light.ttf", "type": "REG_SZ" },
  { "key": "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts", "path": "FiraCode Medium (TrueType)", "value": "FiraCode-Medium.ttf", "type": "REG_SZ" },
  { "key": "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts", "path": "FiraCode Regular (TrueType)", "value": "FiraCode-Regular.ttf", "type": "REG_SZ" },
  { "key": "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts", "path": "FiraCode Retina (TrueType)", "value": "FiraCode-Retina.ttf", "type": "REG_SZ" },
  { "key": "HKLM\\SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\Fonts", "path": "FiraCode SemiBold (TrueType)", "value": "FiraCode-SemiBold.ttf", "type": "REG_SZ" }
])

Console.info("FiraCode installed");