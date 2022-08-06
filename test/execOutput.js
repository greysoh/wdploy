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

module.exports = exec;