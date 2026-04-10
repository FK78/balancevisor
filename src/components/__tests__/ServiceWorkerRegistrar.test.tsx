// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { ServiceWorkerRegistrar } from "@/components/ServiceWorkerRegistrar";

describe("ServiceWorkerRegistrar", () => {
  beforeEach(() => {
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: {
        register: vi.fn().mockResolvedValue({
          addEventListener: vi.fn(),
          installing: null,
        }),
      },
    });
  });

  it("does not attach a root beforeinstallprompt listener", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");

    render(<ServiceWorkerRegistrar />);

    expect(addEventListenerSpy).not.toHaveBeenCalledWith(
      "beforeinstallprompt",
      expect.any(Function),
    );
  });
});
