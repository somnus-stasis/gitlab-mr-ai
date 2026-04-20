import { formatTicket } from "../../../src/core/ticket/formatTicket";

describe("formatTicket", () => {
  it("should prefix numeric tickets with #", () => {
    expect(formatTicket("123")).toBe("#123");
  });

  it("should keep prefixed tickets unchanged", () => {
    expect(formatTicket("OPS-12")).toBe("OPS-12");
  });
});
