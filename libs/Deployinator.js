/**
 * Downloads a file from a remote server and saves it locally.
 * @param {string} source Source URL
 * @param {string} destination Destination path
 */
export async function downloadFile(source, destination) {
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

/**
 * Sleeps for a certain amount of time.
 * @param {number} ms Time in milliseconds
 * @returns {Promise} Promise that resolves after the time has passed
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}