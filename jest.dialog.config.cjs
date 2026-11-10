// Isolated Jest config for ConfirmButton + <dialog> integration (CJS + babel-jest).
// The main suite uses native ESM; this project imports JSX components only here.
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.dialog.setup.cjs'],
  testMatch: [
    '<rootDir>/src/components/__tests__/ConfirmButton.dialog.test.js',
    '<rootDir>/src/hooks/__tests__/useDialogSync.persist.test.js',
  ],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  moduleFileExtensions: ['js', 'jsx', 'json'],
}
