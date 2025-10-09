import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import { builtinModules } from 'node:module';

export default {
    input: 'src/index.ts',
    output: {
        file: 'dist/index.js',
        format: 'esm',
        banner: '#!/usr/bin/env node',
    },
    plugins: [
        resolve({
            preferBuiltins: true,
        }),
        commonjs(),
        json(),
        typescript({
            tsconfig: './tsconfig.json',
        }),
    ],
    external: [...builtinModules],
};
