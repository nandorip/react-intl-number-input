module.exports = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleFileExtensions: ["js", "jsx", "ts", "tsx"],
  moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" },
  testMatch: ["**/*.test.tsx"],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/jest-esbuild.cjs"
  }
};
