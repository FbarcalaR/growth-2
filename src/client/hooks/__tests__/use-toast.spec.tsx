// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { clearAll, dismiss, toast, useToastStore } from "../use-toast";

beforeEach(() => {
  clearAll();
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("toast pub-sub", () => {
  it("publishes toasts and exposes them via useToastStore", () => {
    const { result } = renderHook(() => useToastStore());
    act(() => {
      toast.success("Saved");
    });
    expect(result.current).toHaveLength(1);
    expect(result.current[0]).toMatchObject({ variant: "success", message: "Saved" });
  });

  it("auto-dismisses after the configured duration", () => {
    const { result } = renderHook(() => useToastStore());
    act(() => {
      toast.error("Boom", 100);
    });
    expect(result.current).toHaveLength(1);
    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toHaveLength(0);
  });

  it("dismiss(id) removes a single toast", () => {
    const { result } = renderHook(() => useToastStore());
    let id1 = 0;
    act(() => {
      id1 = toast.info("a");
      toast.info("b");
    });
    expect(result.current).toHaveLength(2);
    act(() => {
      dismiss(id1);
    });
    expect(result.current.map((t) => t.message)).toEqual(["b"]);
  });

  it("clearAll empties the queue", () => {
    const { result } = renderHook(() => useToastStore());
    act(() => {
      toast.info("a");
      toast.info("b");
      toast.info("c");
    });
    expect(result.current).toHaveLength(3);
    act(() => {
      clearAll();
    });
    expect(result.current).toHaveLength(0);
  });
});
