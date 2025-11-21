import { act, renderHook } from "@testing-library/react";
import { useLocalStorage } from ".";

const map = new Map<string, string | null>();

vi.stubGlobal("localStorage", {
  getItem: vi.fn((key: string) => map.get(key) ?? null),
  setItem: vi.fn((key: string, value: string) => {
    map.set(key, value);
    window.dispatchEvent(
      new StorageEvent("storage", {
        key,
        storageArea: localStorage,
        newValue: value,
      }),
    );
  }),
});

describe("useStorage", () => {
  it("should store and retrieve a value from localStorage", () => {
    const { result } = renderHook(() =>
      useLocalStorage("test", 1, {
        schema: {
          "~standard": {
            version: 1,
            vendor: "custom",
            validate: (data) => {
              const v = Number(data);

              if (isNaN(v)) {
                return {
                  issues: [],
                };
              }

              return {
                value: v,
              };
            },
          },
        },
      }),
    );

    act(() => {
      const set = result.current[1];
      set(100);
    });

    expect(result.current[0]).toBe(100);

    act(() => {
      localStorage.setItem("test", "200");
    });

    expect(result.current[0]).toBe(200);
  });
});
