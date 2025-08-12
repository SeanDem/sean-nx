import { addProjectConfiguration, formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { multiAppGeneratorSchema } from './schema';

export async function multiAppGenerator(tree: Tree, options: multiAppGeneratorSchema) {
  // Prompt user for which apps to generate (web, ios, android) if not provided
  let appTypes: string[] = [];
  if (Array.isArray((options as any).platforms) && (options as any).platforms.length > 0) {
    appTypes = (options as any).platforms;
  } else {
    // Fallback to all if not provided, since prompt is not available
    appTypes = ['web', 'ios', 'android'];
  }

  const libRoot = `libs/${options.name}-shared`;
  addProjectConfiguration(tree, `${options.name}-shared`, {
    root: libRoot,
    projectType: 'library',
    sourceRoot: `${libRoot}/src`,
    targets: {},
  });
  generateFiles(tree, path.join(__dirname, 'files'), libRoot, options);

  const sharedEntryDir = `${libRoot}/src/shared`;
  if (!tree.exists(sharedEntryDir)) {
    tree.write(`${sharedEntryDir}/index.ts`, `// ${options.name}-shared entry point\n`);
  }

  // Add config files to shared lib
  // eslint.config.js
  tree.write(
    `${libRoot}/eslint.config.js`,
    `module.exports = { root: true, extends: ['../../.eslintrc.json'] };`
  );
  // jest.config.ts
  tree.write(
    `${libRoot}/jest.config.ts`,
    `import baseConfig from '../../jest.config';\nexport default { ...baseConfig, displayName: '${options.name}-shared', preset: '../../jest.preset.js' };`
  );
  // tsconfig.json
  tree.write(
    `${libRoot}/tsconfig.json`,
    `{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../dist/out-tsc",
    "types": ["jest"]
  },
  "files": [],
  "include": ["src/**/*.ts"]
}`
  );
  // tsconfig.lib.json
  tree.write(
    `${libRoot}/tsconfig.lib.json`,
    `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "declaration": true,
    "declarationMap": true
  },
  "exclude": ["**/*.spec.ts", "**/*.test.ts"]
}`
  );
  // tsconfig.spec.json
  tree.write(
    `${libRoot}/tsconfig.spec.json`,
    `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": ["**/*.spec.ts", "**/*.test.ts", "**/*.d.ts"]
}`
  );

  // Create app entry points under apps/<name>/
  for (const app of appTypes) {
    const appRoot = `apps/${options.name}/${app}`;
    addProjectConfiguration(tree, `${options.name}-${app}`, {
      root: appRoot,
      projectType: 'application',
      sourceRoot: `${appRoot}/src`,
      targets: {},
    });
    // Create entry point for each app
    const entryDir = `${appRoot}/src`;
    if (!tree.exists(entryDir)) {
      tree.write(`${entryDir}/index.ts`, `// ${options.name} ${app} entry point\n`);
    }
    // Add config files to each app
    tree.write(
      `${appRoot}/eslint.config.js`,
      `module.exports = { root: true, extends: ['../../../.eslintrc.json'] };`
    );
    tree.write(
      `${appRoot}/jest.config.ts`,
      `import baseConfig from '../../../jest.config';\nexport default { ...baseConfig, displayName: '${options.name}-${app}', preset: '../../../jest.preset.js' };`
    );
    tree.write(
      `${appRoot}/tsconfig.json`,
      `{
  "extends": "../../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "../../../dist/out-tsc",
    "types": ["jest"]
  },
  "files": [],
  "include": ["src/**/*.ts"]
}`
    );
    tree.write(
      `${appRoot}/tsconfig.app.json`,
      `{
  "extends": "./tsconfig.json",
  "compilerOptions": {},
  "exclude": ["**/*.spec.ts", "**/*.test.ts"]
}`
    );
    tree.write(
      `${appRoot}/tsconfig.spec.json`,
      `{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "include": ["**/*.spec.ts", "**/*.test.ts", "**/*.d.ts"]
}`
    );
  }

  await formatFiles(tree);
}

export default multiAppGenerator;
