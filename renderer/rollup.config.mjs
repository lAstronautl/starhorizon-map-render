import fs from 'node:fs';
import path from 'node:path';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';
import stringImport from 'rollup-plugin-string-import';

const modules = [
  'index',
  'cli',
];

const env = process.env.NODE_ENV || 'production';
const isDev = env === 'development';

const dir = import.meta.dirname;
const pkg = JSON.parse(fs.readFileSync(`${dir}/package.json`));

const plugins = [
  typescript({
    tsconfig: `./tsconfig.json`,
    rootDir: `./src`,
    noEmitOnError: false,
    declaration: true,
    sourceMap: true,
  }),

  stringImport({
    include: '**/*.yml',
  }),

  !isDev && terser(),
].filter(Boolean);

const localDepPattern = /^\.\.?\//;

const entries = new Map(modules.map(name =>
  [path.resolve(dir, `src/${name}.js`), name]
));
const loadedModules = new Map();

const external = (fromSubmodule) => {
  const dependencies = new Set([
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ]);

  const devDependencies = new Set(Object.keys(pkg.devDependencies || {}));

  const isDependency = (deps, id) => {
    if (!localDepPattern.test(id)) {
      if (deps.has(id)) {
        return true;
      }

      for (const dep of deps) {
        // Catch submodule imports like `react/jsx-runtime`.
        if (id.startsWith(`${dep}/`)) {
          return true;
        }
      }
    }
    return false;
  };

  return (id, parent) => {
    if (
      id.startsWith('node:') ||
      isDependency(dependencies, id) ||
      isDependency(devDependencies, id)
    ) {
      return true;
    }

    const fullParent = path.resolve(dir, parent);
    const fullId = path.resolve(path.dirname(fullParent), id);
    const otherModule = entries.get(fullId);
    if (otherModule && otherModule !== fromSubmodule) {
      // Treat the other project modules as external.
      return true;
    }
    const loadedBy = loadedModules.get(fullId);
    if (!loadedBy) {
      loadedModules.set(fullId, fromSubmodule);
    } else if (loadedBy !== fromSubmodule) {
      console.warn(`WARN: file imported from multiple submodules: ${fullId}`);
    }
    return false;
  };
};

export default modules.map(name => ({
  input: `./src/${name}.ts`,
  output: {
    file: `./dist/${name}.js`,
    format: 'es',
    sourcemap: true,
  },
  plugins,
  external: external(name),
}));
