import { describe, it, expect, vi, beforeEach } from "vitest";

describe("printEnvironmentVariables", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  it("should print environment variables except sensitive ones", async () => {
    vi.doMock("chalk", () => ({
      __esModule: true,
      default: {
        blue: { bold: (v: any) => v },
        cyan: { bold: (v: any) => v },
        green: (v: any) => v,
        yellow: (v: any) => v,
      },
    }));

    vi.doMock("../../src/config/env", () => ({
      env: {
        appName: "TestApp",
        version: "1.0.0",
        jwtSecret: "hidden",
        nested: {
          port: 3000,
          databaseUrl: "hidden-db",
        },
      },
    }));

    const { printEnvironmentVariables } = await import("../../src/util/env-printer");

    printEnvironmentVariables();

    const outputCalls = (console.log as any).mock.calls.flat().join(" ");

    expect(outputCalls).toContain("Application Configuration");
    expect(outputCalls).toContain("appName");
    expect(outputCalls).toContain("version");
    expect(outputCalls).toContain("port");

    expect(outputCalls).not.toContain("jwtSecret");
    expect(outputCalls).not.toContain("databaseUrl");
  });
});
