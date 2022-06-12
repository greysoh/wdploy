const exec = require("./execOutput");

test("Normal/legacy execution", async() => {
    const output = await exec("../wdploy.exe test_config_valid\\index.json");

    console.log("STDOUT:", output.stdout);
    console.log("STDERR:", output.stderr);

    expect(output.code).toBe(0); 
})

test("Invalid JSON file", async() => {
    const output = await exec("../wdploy.exe test_config_invalid\\01_invalidjson.json");

    console.log("STDOUT:", output.stdout);
    console.log("STDERR:", output.stderr);

    expect(output.code).toBe(2);
})

test("Missing path in JSON", async() => {
    const output = await exec("../wdploy.exe test_config_invalid\\02_missingpath.json");

    console.log("STDOUT:", output.stdout);
    console.log("STDERR:", output.stderr);

    expect(output.code).toBe(2);
})

test("Throwed error", async() => {
    const output = await exec("../wdploy.exe test_config_invalid\\03_slam.json");

    console.log("STDOUT:");
    console.log(output.stdout);
    console.log("STDERR:");
    console.log(output.stderr);

    expect(output.code).toBe(0);
})

test("Nonexistant/down network when doing request", async() => {
    jest.setTimeout(10000);

    const output = await exec("../wdploy.exe https://100.100.100.100/04_invalid_network.json");
    
    console.log("STDOUT:");
    console.log(output.stdout);
    console.log("STDERR:");
    console.log(output.stderr);

    expect(output.code).toBe(0);
})