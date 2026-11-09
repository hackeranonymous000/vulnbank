// The orval output exports zod schemas (./generated/api) and model types
// (./generated/types) under overlapping names, so the schemas are namespaced.
export * from "./generated/types";
export * as apiSchemas from "./generated/api";
