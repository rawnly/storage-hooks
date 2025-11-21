type Ok<T> =
	| {
			ok: true;
			value: T;
	  }
	| {
			ok: false;
	  };

export function parseJSON<T>(value: string): Ok<T> {
	try {
		return {
			ok: true,
			value: JSON.parse(value),
		};
	} catch {
		return {
			ok: false,
		};
	}
}
