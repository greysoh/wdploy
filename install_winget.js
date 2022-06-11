const WindowsAPI = await import("./WindowsAPI.js");

let wingetDeps = [
  {
    path: "https://cdn.glitch.global/f59350b4-4fb2-4f0d-8c76-2905b1a7267f/vclibs.appx?v=1654974147031",
    name: "VCLibs.appx",
  },
  {
    path: "https://cdn.glitch.global/f59350b4-4fb2-4f0d-8c76-2905b1a7267f/uixaml.appx?v=1654974173853",
    name: "UIXaml.appx",
  },
];

async function download(source, destination) {
  // We use browser fetch API
  const response = await fetch(source);
  const blob = await response.blob();

  // We convert the blob into a typed array
  // so we can use it to write the data into the file
  const buf = await blob.arrayBuffer();
  const data = new Uint8Array(buf);

  // We then create a new file and write into it
  const file = await Deno.create(destination);
  await Deno.writeAll(file, data);

  // We can finally close the file
  Deno.close(file.rid);
}

async function get(source) {
    // We use browser fetch API
    const response = await fetch(source);

    // Return string data
    return response.text();
}

export default async function installWinget() {
  console.log("Locating winget...");
  let wingetPath = await get("https://api.github.com/repos/microsoft/winget-cli/releases/latest");
  wingetPath = JSON.parse(wingetPath).assets;

  for (let i of wingetPath) {
    if (i.name.startsWith("Microsoft.DesktopAppInstaller") && i.name.endsWith(".msixbundle")) {
        wingetPath = i.browser_download_url;
        break;
    }
  }

  wingetDeps.push({
    path: wingetPath,
    name: "Winget.msixbundle",
  })

  for await (let i of wingetDeps) {
    console.log("Downloading " + i.name);
    await download(i.path, Deno.env.get("TEMP") + "\\" + i.name);
    console.log("Installing " + i.name);
    await WindowsAPI.runBatch(`@echo off
    cd ${Deno.env.get("TEMP")}
    powershell /c "Add-AppxPackage ${i.name}"`);
  }
}