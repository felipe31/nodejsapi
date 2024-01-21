import { parse } from "csv-parse";
import fs from "fs";

export function parseCSV(path?: string): Promise<string[][]> {
  if (!path || !path.endsWith(".csv")) {
    throw new Error("Invalid CSV path!");
  }

  return new Promise((resolve) => {
    const rows: string[][] = [];

    fs.createReadStream(path)
      .pipe(parse({ delimiter: ";", from_line: 2 }))

      .on("data", async (row: string[]) => {
        rows.push(row);
      })

      .on("end", () => resolve(rows));
  });
}
