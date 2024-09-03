import * as v from "valibot";
// import type { AnySchema } from "valibot";

// type MappingSchema =
//   | v.BaseSchema
//   | v.ObjectSchema<v.ObjectEntries>
//   | v.ArraySchema<v.BaseSchema>
//   | v.StringSchema
//   | v.DateSchema;
type MappingSchema = v.ObjectSchema<v.ObjectEntries, undefined>;

// const Schema = v.any();

// type t = ReturnType<typeof v.object>;

// type LoginInput = v.InferInput<typeof AnySchema>;

export function validateSchemaToData<T>(schema: MappingSchema, data: T) {
  try {
    v.parse(schema, data);
  } catch (error) {
    if (v.isValiError(error)) {
      console.error(
        "**** Client-side expectations do not match what the server returned ****",
      );
      console.error("Server data:", data);
      console.error("Expected schema:", schema);
      console.error("Study the error to see what's different", error);
    }
    throw error;
  }
}
