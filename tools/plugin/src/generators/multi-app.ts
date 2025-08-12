import { addProjectConfiguration, formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { multiAppGeneratorSchema } from './schema';

export async function multiAppGenerator(tree: Tree, options: multiAppGeneratorSchema) {
  // Create shared lib under libs
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

  // Create app entry points under apps/<name>/
  const appTypes = ['ios', 'android', 'web'];
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
  }

  await formatFiles(tree);
}

export default multiAppGenerator;
