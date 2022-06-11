await WindowsAPI.runReg([
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Wallpapers", "path": "BackgroundType", "value": 1, "type": "REG_DWORD" },
  { "key": "HKEY_CURRENT_USER\\Control Panel\\Desktop", "path": "WallPaper", "value": " ", "type": "REG_SZ" },
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer"},
  { "key": "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Policies\\Explorer", "path": "NoDesktop", "value": 1, "type": "REG_DWORD" },
  { "key": "HKEY_CURRENT_USER\\Control Panel\\Colors", "path": "Background", "value": "0 0 0", "type": "REG_SZ" }
])

Console.info("Please reboot.")