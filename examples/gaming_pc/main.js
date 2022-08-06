// Main desktop configuration
// Modernized version of 'desktop_config', with development stuff removed (fira code, etc).

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Use ninite for compatibility with legacy windows versions.

Console.info("Installing applications...");
await WindowsAPI.runNinite("firefox steam spotify");

// Install rest of apps using winget, as it has the most packages.

await WindowsAPI.installWingetCMD(
  "EpicGames.EpicGamesLauncher Moonsworth.LunarClient Mojang.MinecraftLauncher"
);

// Runs code to set black wallpaper and dark mode.

await WindowsAPI.runReg([
  {
    key: "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers",
    path: "BackgroundType",
    value: 1,
    type: "REG_DWORD",
  }, // Sets background type to solid color
  {
    key: "HKEY_CURRENT_USER\\Control Panel\\Desktop",
    path: "WallPaper",
    value: " ",
    type: "REG_SZ",
  }, // Clears background
  {
    key: "HKEY_CURRENT_USER\\Control Panel\\Colors",
    path: "Background",
    value: "0 0 0",
    type: "REG_SZ",
  }, // Sets background color to black
  {
    key: "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer",
  }, // Creates key for hiding desktop icons
  {
    key: "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer",
    path: "NoDesktop",
    value: 1,
    type: "REG_DWORD",
  }, // Hides desktop icons
  {
    key: "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
    path: "AppsUseLightTheme",
    value: 0,
    type: "REG_DWORD",
  }, // Sets theme to dark
  {
    key: "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize",
    path: "SystemUsesLightTheme",
    value: 0,
    type: "REG_DWORD",
  }, // Sets theme to dark
]);

await sleep(10 * 1000); // 10 seconds

Console.info("Rebooting...");
await WindowsAPI.runBatch("shutdown -r -t 0");
