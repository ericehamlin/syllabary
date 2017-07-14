// rollup.config.js
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

export default {
  entry: 'src/Syllabary.js',
  format: 'iife',
	plugins: [
		resolve({
			module: true,
			preferBuiltins: false,
			jsnext: true
		}),
		babel({
			exclude: 'node_modules/**' // only transpile our source code
		})
	],
	moduleName: 'Syllabary',
  dest: 'dist/syllabary.js', // equivalent to --output
  sourceMap: true
};
