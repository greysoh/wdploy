const { spawn } = require("child_process");

async function exec(cmd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd.split(" ")[0], cmd.split(" ").slice(1));
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (data) => {
      stdout += data;
    });
    child.stderr.on("data", (data) => {
      stderr += data;
    });
    child.on("close", (code) => {
      resolve({
        code,
        stdout,
        stderr,
      });
    });
  });
}

async function main() {
    const { code, stdout, stderr } = await exec("wdploy.exe error");
    console.log(`code: ${code}`);
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
}

module.exports = exec;