import { addProjectConfiguration, formatFiles, generateFiles, Tree } from '@nx/devkit';
import * as path from 'path';
import { multiAppGeneratorSchema } from './schema';

// Fix: Use the correct type for options and extend it to include platforms if missing
type MultiAppGeneratorOptions = multiAppGeneratorSchema & { platforms?: string[] };

function createAppSrcFiles(tree: Tree, appRoot: string, app: string, name: string) {
  const srcDir = `${appRoot}/src`;
  // main.ts
  tree.write(
    `${srcDir}/main.ts`,
    `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
`
  );
  // app.module.ts
  tree.write(
    `${srcDir}/app.module.ts`,
    `import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule],
  bootstrap: [AppComponent]
})
export class AppModule {}
`
  );
  // app.component.ts
  tree.write(
    `${srcDir}/app.component.ts`,
    `import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: '<h1>Welcome to ${name} (${app})!</h1>',
  styles: []
})
export class AppComponent {}
`
  );
  // index.html
  tree.write(
    `${srcDir}/index.html`,
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>${name} ${app}</title>
  <base href="/" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <app-root></app-root>
</body>
</html>
`
  );
  // styles.scss
  tree.write(
    `${srcDir}/styles.scss`,
    `/* Add global styles for ${name} ${app} here */`
  );
  // capacitor.config.ts for ios/android
  if (app === 'ios' || app === 'android') {
    tree.write(
      `${appRoot}/capacitor.config.ts`,
      `import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.${name}',
  appName: '${name}',
  webDir: 'dist/${appRoot}/browser',
  bundledWebRuntime: false
};

export default config;
`
    );
  }
}

export async function multiAppGenerator(tree: Tree, options: MultiAppGeneratorOptions) {
  // Prompt user for which apps to generate (web, ios, android) if not provided
  let appTypes: string[] = [];
  if (Array.isArray(options.platforms) && options.platforms.length > 0) {
    appTypes = options.platforms;
  } else {
    // Fallback to all if not provided, since prompt is not available
    appTypes = ['web', 'ios', 'android'];
  }

  const libRoot = `libs/${options.name}-shared`;
  addProjectConfiguration(tree, `${options.name}-shared`, {
    root: libRoot,
    projectType: 'library',
    sourceRoot: `${libRoot}/src`,
    targets: {
      lint: {
        executor: '@nx/eslint:lint',
        options: {
          lintFilePatterns: [`${libRoot}/**/*.ts`]
        }
      },
      test: {
        executor: '@nx/jest:jest',
        outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
        options: {
          jestConfig: `${libRoot}/jest.config.ts`
        }
      },
      build: {
        executor: '@nx/js:tsc',
        outputs: ['{options.outputPath}'],
        options: {
          outputPath: `dist/${libRoot}`,
          main: `${libRoot}/src/index.ts`,
          tsConfig: `${libRoot}/tsconfig.lib.json`,
          assets: []
        }
      }
    }
  });
  generateFiles(tree, path.join(__dirname, 'files'), libRoot, options);

  const sharedEntryDir = `${libRoot}/src/shared`;
  if (!tree.exists(`${sharedEntryDir}/index.ts`)) {
    // Ensure directory exists before writing file
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

  for (const app of appTypes) {
    const appRoot = `apps/${options.name}/${app}`;
    addProjectConfiguration(tree, `${options.name}-${app}`, {
      root: appRoot,
      projectType: 'application',
      sourceRoot: `${appRoot}/src`,
      targets: {
        build: {
          executor: '@angular/build:application',
          outputs: ['{options.outputPath}'],
          options: {
            outputPath: `dist/${appRoot}`,
            browser: `${appRoot}/src/main.ts`,
            polyfills: ['zone.js'],
            tsConfig: `${appRoot}/tsconfig.app.json`,
            inlineStyleLanguage: 'scss',
            assets: [
              {
                glob: '**/*',
                input: `${appRoot}/public`
              }
            ],
            styles: [`${appRoot}/src/styles.scss`]
          },
          configurations: {
            prod: {
              budgets: [
                {
                  type: 'initial',
                  maximumWarning: '500kb',
                  maximumError: '1mb'
                },
                {
                  type: 'anyComponentStyle',
                  maximumWarning: '4kb',
                  maximumError: '8kb'
                }
              ],
              outputHashing: 'all'
            },
            dev: {
              optimization: false,
              extractLicenses: false,
              sourceMap: true
            }
          },
          defaultConfiguration: 'prod'
        },
        serve: {
          continuous: true,
          executor: '@angular/build:dev-server',
          configurations: {
            prod: {
              buildTarget: `${options.name}-${app}:build:prod`
            },
            dev: {
              buildTarget: `${options.name}-${app}:build:dev`
            }
          },
          defaultConfiguration: 'dev'
        },
        'extract-i18n': {
          executor: '@angular/build:extract-i18n',
          options: {
            buildTarget: `${options.name}-${app}:build`
          }
        },
        lint: {
          executor: '@nx/eslint:lint'
        },
        test: {
          executor: '@nx/jest:jest',
          outputs: ['{workspaceRoot}/coverage/{projectRoot}'],
          options: {
            jestConfig: `${appRoot}/jest.config.ts`
          }
        },
        'serve-static': {
          continuous: true,
          executor: '@nx/web:file-server',
          options: {
            buildTarget: `${options.name}-${app}:build`,
            port: 4200,
            staticFilePath: `dist/${appRoot}/browser`,
            spa: true
          }
        },
        // Add Ionic Capacitor targets for ios/android
        ...(app === 'ios' || app === 'android'
          ? {
              'cap.sync': {
                executor: '@nx/capacitor:sync',
                options: {
                  platform: app
                }
              },
              'cap.open': {
                executor: '@nx/capacitor:open',
                options: {
                  platform: app
                }
              },
              'cap.add': {
                executor: '@nx/capacitor:add',
                options: {
                  platform: app
                }
              },
              'cap.copy': {
                executor: '@nx/capacitor:copy',
                options: {
                  platform: app
                }
              },
              'cap.update': {
                executor: '@nx/capacitor:update',
                options: {
                  platform: app
                }
              },
              'cap.serve': {
                executor: '@nx/capacitor:serve',
                options: {
                  platform: app
                }
              }
            }
          : {})
      }
    });
    // Create entry point for each app
    const entryDir = `${appRoot}/src`;
    if (!tree.exists(`${entryDir}/index.ts`)) {
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

    // Create minimal /src files for each app
    createAppSrcFiles(tree, appRoot, app, options.name);
  }

  await formatFiles(tree);
}

export default multiAppGenerator;
