import { useCallback, useSyncExternalStore } from "react";
import { type StandardSchemaV1, syncValidateSchema } from "./standard-schema";
import { parseJSON } from "./utils";

type StorageValue<T = string> = T | null;

function subscribeToStorage(
	key: string,
	storage: Storage,
	callback: (v: StorageValue) => void,
) {
	function handleStorageEvent(event: StorageEvent) {
		console.log(event.key, event.newValue);
		if (event.storageArea !== storage || event.key !== key) return;
		callback(event.newValue);
	}

	window.addEventListener("storage", handleStorageEvent);
	return () => window.removeEventListener("storage", handleStorageEvent);
}

interface Options<T> {
	storage: Storage;
	schema?: StandardSchemaV1<T>;
}

export function useStorage<T>(
	key: string,
	defaultValue: T | null,
	options: Options<T>,
) {
	function parseValue(value: string | null): T | null {
		if (!value) return defaultValue;
		const parsedValue = parseJSON<T>(value);

		if (!parsedValue.ok) return defaultValue;

		if (options.schema)
			return syncValidateSchema(options.schema, parsedValue.value);

		return parsedValue.value;
	}

	const value = useSyncExternalStore(
		(callback) => subscribeToStorage(key, options.storage, callback),
		() => parseValue(options.storage.getItem(key)),
		() => null,
	);

	const setValue = useCallback(
		(newValue: React.SetStateAction<T>) => {
			const v = newValue instanceof Function ? newValue(value) : newValue;
			options.storage.setItem(key, JSON.stringify(v));

			// MDN: The event is not fired on the window that made the change
			// https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
			window.dispatchEvent(
				new StorageEvent("storage", {
					key,
					oldValue: value ? JSON.stringify(value) : null,
					newValue: v ? JSON.stringify(v) : null,
					storageArea: options.storage,
					url: window.location.href,
				}),
			);
		},
		[key, value, options.storage],
	);

	return [value, setValue] as const;
}

export function useLocalStorage<T>(
	key: string,
	defaultValue: T | null = null,
	options: Omit<Options<T>, "storage"> = {},
) {
	return useStorage(key, defaultValue, {
		...options,
		storage: localStorage,
	});
}

export function useSessionStorage<T>(
	key: string,
	defaultValue: T | null = null,
	options: Omit<Options<T>, "storage"> = {},
) {
	return useStorage(key, defaultValue, {
		...options,
		storage: sessionStorage,
	});
}
