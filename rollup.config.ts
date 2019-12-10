import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import del from 'rollup-plugin-delete';
import ts from "rollup-plugin-ts";
import { terser } from 'rollup-plugin-terser';

export default [
    {
        external: ['ua-parser-js', 'vue', 'coderr.client'],
        input: `src/index.ts`,
        output: [
            {
                globals: {
                    'ua-parser-js': 'UAParser',
                    'vue': 'Vue'
                },
                name: 'coderr',
                file: 'dist/coderr.vue.js',
                format: 'umd',
                sourcemap: true,
            },
            {
                globals: {
                    'ua-parser-js': 'UAParser',
                    'vue': 'Vue'
                },
                file: 'dist/coderr.vue.min.js',
                name: 'coderr',
                format: 'umd',
                sourcemap: true,
                plugins: [terser()]
            },
            {
                file: 'dist/coderr-vue.esm.js',
                format: 'es',
                sourcemap: true
            },
            {
                file: 'dist/coderr-vue.esm.min.js',
                format: 'es',
                sourcemap: true,
                plugins: [terser()]
            }
        ],
        plugins: [
            del({ targets: 'dist/*' }),
            ts(),
            resolve(),
            commonjs(),
        ],
    }
];
