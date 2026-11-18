import { describe, expect, test } from "vitest";

import { isBlockedAddress } from "./address";

describe("isBlockedAddress", () => {
  test.each([
    "127.0.0.1",
    "10.1.2.3",
    "172.16.0.1",
    "172.31.255.255",
    "192.168.0.10",
    "169.254.169.254",
    "0.0.0.0",
    "::1",
    "::",
    "fe80::1",
    "fd00::1",
    "::ffff:127.0.0.1",
    "::ffff:7f00:1",
    "[::1]",
  ])("%s 는 거절한다", (ip) => {
    expect(isBlockedAddress(ip)).toBe(true);
  });

  test.each(["93.184.216.34", "172.32.0.1", "8.8.8.8", "2606:4700::1111"])(
    "%s 는 공개 주소로 허용한다",
    (ip) => {
      expect(isBlockedAddress(ip)).toBe(false);
    },
  );
});
