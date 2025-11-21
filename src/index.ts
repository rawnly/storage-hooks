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
		if (event.storageArea !== storage || event.key !== key) return;
		callback(event.newValue);
	}

	window.addEventListener("storage", handleStorageEvent, false);
	return () => window.removeEventListener("storage", handleStorageEvent, false);
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
		() => defaultValue,
	);

	const setValue = useCallback(
		<T>(newValue: T) => {
			localStorage.setItem(key, JSON.stringify(newValue));
		},
		[key],
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
