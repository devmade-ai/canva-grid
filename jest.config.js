export default {
  testEnvironment: 'node',
  testPathIgnorePatterns: ['/node_modules/', 'ConfirmButton.dialog.test.js'],
  transform: {},
  moduleNameMapper: {
    // Handle .jsx imports in tests (shouldn't be needed for pure util tests)
  },
}
