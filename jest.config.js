module.exports = {
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  restoreMocks: true,
  testEnvironment: 'node',
};
