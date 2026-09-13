export default {
  testEnvironment: "node",

  // Clean the test DB once before all test suites run
  globalSetup: "./src/__tests__/globalSetup.ts",

  // Load .env and redirect DATABASE_URL → TEST_DATABASE_URL before every test file
  setupFiles: ["<rootDir>/src/__tests__/loadEnv.ts"],

  testMatch: ["**/__tests__/**/*.test.ts"],
  forceExit: true,
  clearMocks: true,

  // Source files use NodeNext-style ".js" imports (e.g. import x from "./foo.js")
  // but the actual files are ".ts". Strip the ".js" so Jest finds the TypeScript source.
  // IMPORTANT: restrict to relative paths only (./ or ../) so npm packages like
  // "ipaddr.js" are NOT accidentally remapped.
  moduleNameMapper: {
    "^([.]{1,2}/.+)[.]js$": "$1",
  },

  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        // The project tsconfig uses module: NodeNext (outputs ESM).
        // Jest runs in CJS mode, so we override to CommonJS here.
        tsconfig: {
          module: "CommonJS",
          moduleResolution: "node",
          isolatedModules: true,
        },
      },
    ],
  },
};

