import chalk from "chalk";
import { env } from "../config/env";

function printObject(obj: Record<string, any>, indent = 0): void {
  const spacing = " ".repeat(indent);

  for (const [key, value] of Object.entries(obj)) {
    if (
      key.toLowerCase().includes("password") ||
      key.toLowerCase().includes("secret") ||
      key.toLowerCase().includes("token") ||
      key.toLowerCase().includes("database")
    ) {
      continue;
    }

    if (typeof value === "object" && value !== null) {
      console.log(spacing + chalk.cyan.bold(`${key}:`));
      printObject(value, indent + 4);
    } else {
      console.log(spacing + chalk.green(key) + " = " + chalk.yellow(String(value)));
    }
  }
}

export function printEnvironmentVariables(): void {
  console.log(chalk.blue.bold("\n📦 Application Configuration\n"));
  printObject(env);
  console.log("");
}
