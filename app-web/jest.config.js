module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testEnvironment: 'jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  collectCoverageFrom: [
    'src/app/**/*.ts',
    '!src/app/**/*.module.ts',
    '!src/app/**/*.interface.ts',
    '!src/main.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['html', 'lcov', 'text-summary'],
  moduleNameMapper: {
    '@core/(.*)': '<rootDir>/src/app/core/$1',
    '@features/(.*)': '<rootDir>/src/app/features/$1',
    '@shared/(.*)': '<rootDir>/src/app/shared/$1',
    '^primeng/api$': '<rootDir>/node_modules/primeng/fesm2022/primeng-api.mjs',
    '^primeng/avatar$': '<rootDir>/node_modules/primeng/fesm2022/primeng-avatar.mjs',
    '^primeng/button$': '<rootDir>/node_modules/primeng/fesm2022/primeng-button.mjs',
    '^primeng/calendar$': '<rootDir>/node_modules/primeng/fesm2022/primeng-datepicker.mjs',
    '^primeng/card$': '<rootDir>/node_modules/primeng/fesm2022/primeng-card.mjs',
    '^primeng/checkbox$': '<rootDir>/node_modules/primeng/fesm2022/primeng-checkbox.mjs',
    '^primeng/confirmdialog$': '<rootDir>/node_modules/primeng/fesm2022/primeng-confirmdialog.mjs',
    '^primeng/dialog$': '<rootDir>/node_modules/primeng/fesm2022/primeng-dialog.mjs',
    '^primeng/divider$': '<rootDir>/node_modules/primeng/fesm2022/primeng-divider.mjs',
    '^primeng/dropdown$': '<rootDir>/node_modules/primeng/fesm2022/primeng-select.mjs',
    '^primeng/inputnumber$': '<rootDir>/node_modules/primeng/fesm2022/primeng-inputnumber.mjs',
    '^primeng/inputtext$': '<rootDir>/node_modules/primeng/fesm2022/primeng-inputtext.mjs',
    '^primeng/menu$': '<rootDir>/node_modules/primeng/fesm2022/primeng-menu.mjs',
    '^primeng/sidebar$': '<rootDir>/node_modules/primeng/fesm2022/primeng-drawer.mjs',
    '^primeng/table$': '<rootDir>/node_modules/primeng/fesm2022/primeng-table.mjs',
    '^primeng/tag$': '<rootDir>/node_modules/primeng/fesm2022/primeng-tag.mjs',
    '^primeng/toast$': '<rootDir>/node_modules/primeng/fesm2022/primeng-toast.mjs'
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'mjs'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  }
};
