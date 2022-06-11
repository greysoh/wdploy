await WindowsAPI.installWingetCMD("Mozilla.Firefox Spotify.Spotify WinSCP.WinSCP Transmission.Transmission ShareX.ShareX");
await WindowsAPI.installWingetCMD("Microsoft.VisualStudioCode Node.js Python.Python.3 GitHub.cli Git.Git");

Deno.writeTextFile(Deno.env.get("TEMP") + "\\setupdeno.bat", `@echo off
powershell /c "iwr https://deno.land/install.ps1 -useb | iex"`);

await WindowsAPI.executeShell(Deno.env.get("TEMP") + "\\setupdeno.bat");