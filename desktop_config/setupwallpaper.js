await WindowsAPI.runReg([
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers", "path": "BackgroundType", "value": 1, "type": "REG_DWORD" }, // Sets background type to solid color
  { "key": "HKEY_CURRENT_USER\\Control Panel\\Desktop", "path": "WallPaper", "value": " ", "type": "REG_SZ" }, // Clears background
  { "key": "HKEY_CURRENT_USER\\Control Panel\\Colors", "path": "Background", "value": "0 0 0", "type": "REG_SZ" }, // Sets background color to black
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"}, // Creates key for hiding desktop icons
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer", "path": "NoDesktop", "value": 1, "type": "REG_DWORD" }, // Hides desktop icons
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", "path": "AppsUseLightTheme", "value": 0, "type": "REG_DWORD" }, // Sets theme to dark
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Themes\\Personalize", "path": "SystemUsesLightTheme", "value": 0, "type": "REG_DWORD" }, // Sets theme to dark
]);