import { describe, expect, it } from "vitest";
import { BcryptPasswordHasher } from "../../../src/infraestructure/security/bcrypt-password-hasher";

describe("BcryptPasswordHasher", () => {
  it("hashes and verifies values using the configured cost", async () => {
    const hasher = new BcryptPasswordHasher();
    const hash = await hasher.hash("test-value", 4);
    expect(hash).not.toBe("test-value");
    expect(await hasher.compare("test-value", hash)).toBe(true);
    expect(await hasher.compare("other-value", hash)).toBe(false);
  });
});
