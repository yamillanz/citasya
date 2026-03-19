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
    '^primeng/base$': '<rootDir>/node_modules/primeng/fesm2022/primeng-base.mjs',
    '^primeng/basecomponent$': '<rootDir>/node_modules/primeng/fesm2022/primeng-basecomponent.mjs',
    '^primeng/bind$': '<rootDir>/node_modules/primeng/fesm2022/primeng-bind.mjs',
    '^primeng/avatargroup$': '<rootDir>/node_modules/primeng/fesm2022/primeng-avatargroup.mjs',
    '^primeng/button$': '<rootDir>/node_modules/primeng/fesm2022/primeng-button.mjs',
    '^primeng/calendar$': '<rootDir>/node_modules/primeng/fesm2022/primeng-datepicker.mjs',
    '^primeng/card$': '<rootDir>/node_modules/primeng/fesm2022/primeng-card.mjs',
    '^primeng/checkbox$': '<rootDir>/node_modules/primeng/fesm2022/primeng-checkbox.mjs',
    '^primeng/confirmdialog$': '<rootDir>/node_modules/primeng/fesm2022/primeng-confirmdialog.mjs',
    '^primeng/dialog$': '<rootDir>/node_modules/primeng/fesm2022/primeng-dialog.mjs',
    '^primeng/divider$': '<rootDir>/node_modules/primeng/fesm2022/primeng-divider.mjs',
    '^primeng/drawer$': '<rootDir>/node_modules/primeng/fesm2022/primeng-drawer.mjs',
    '^primeng/dropdown$': '<rootDir>/node_modules/primeng/fesm2022/primeng-select.mjs',
    '^primeng/inputnumber$': '<rootDir>/node_modules/primeng/fesm2022/primeng-inputnumber.mjs',
    '^primeng/inputtext$': '<rootDir>/node_modules/primeng/fesm2022/primeng-inputtext.mjs',
    '^primeng/menu$': '<rootDir>/node_modules/primeng/fesm2022/primeng-menu.mjs',
    '^primeng/message$': '<rootDir>/node_modules/primeng/fesm2022/primeng-message.mjs',
    '^primeng/progressspinner$': '<rootDir>/node_modules/primeng/fesm2022/primeng-progressspinner.mjs',
    '^primeng/select$': '<rootDir>/node_modules/primeng/fesm2022/primeng-select.mjs',
    '^primeng/sidebar$': '<rootDir>/node_modules/primeng/fesm2022/primeng-drawer.mjs',
    '^primeng/table$': '<rootDir>/node_modules/primeng/fesm2022/primeng-table.mjs',
    '^primeng/tag$': '<rootDir>/node_modules/primeng/fesm2022/primeng-tag.mjs',
    '^primeng/toast$': '<rootDir>/node_modules/primeng/fesm2022/primeng-toast.mjs',
    '^primeng/([^/]+)$': '<rootDir>/node_modules/primeng/fesm2022/primeng-$1.mjs',
    '^primeng/types/([^/]+)$': '<rootDir>/node_modules/primeng/fesm2022/primeng-types-$1.mjs',
    '^primeng/icons/([^/]+)$': '<rootDir>/node_modules/primeng/fesm2022/primeng-icons-$1.mjs'
  },
  moduleFileExtensions: ['ts', 'js', 'html', 'mjs'],
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.spec.json',
      stringifyContentPathRegex: '\\.(html|svg)$'
    }
  }
};
