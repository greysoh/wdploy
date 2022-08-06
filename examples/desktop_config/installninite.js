let apps = "";

Console.info("Manually install the following apps:");
Console.info("  - Transmission");
Console.info("  - Node.js");
Console.info("  - Github CLI");
Console.info("  - Git");
Console.info("  - Epic Games Launcher");
Console.info("  - Minecraft & Lunar");

apps += "firefox spotify winscp sharex "; // Main apps
apps += "vscode pythonx3 adoptjavax8 "; // Programming
apps += "steam" // Gaming

await WindowsAPI.runNinite(apps);

await WindowsAPI.runBatch(`@echo off
powershell /c "iwr https://deno.land/install.ps1 -useb | iex"`);