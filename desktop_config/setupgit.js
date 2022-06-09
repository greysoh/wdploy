Deno.writeTextFile(Deno.env.get("TEMP") + "\\setupgit.bat", `@echo off
git config --global user.name "greysoh"
git config --global user.email "greysoh@pm.me"`);

WindowsAPI.executeShell(Deno.env.get("TEMP") + "\\setupgit.bat");