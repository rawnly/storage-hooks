import { parseJSON } from "./utils";

describe("parseJSON", () => {
	test("should parse valid JSON string", () => {
		const jsonString = '{"name": "John", "age": 30}';
		const result = parseJSON(jsonString);

		expect(result).toEqual({
			ok: true,
			value: { name: "John", age: 30 },
		});
	});

	test("should return error for invalid JSON string", () => {
		const jsonString = '{"name": "John", "age": 30'; // Missing closing brace
		const result = parseJSON(jsonString);

		expect(result.ok).toBe(false);
	});
});
