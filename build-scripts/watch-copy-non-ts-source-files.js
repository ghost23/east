/**
 * Created by mail on 07.12.2016.
 */

const watchr = require('watchr');
const copyNonTSSourceFiles = require('./copy-non-ts-source-files');

typeScriptFileDetect = /\.ts$/;

const path = process.cwd() + "/src/";
function listener(changeType, fullPath) {
	if(fullPath.match(typeScriptFileDetect) === null) {
		console.log("file changed: " + fullPath);
		copyNonTSSourceFiles();
	}
}
function next(err) {
	if ( err )  return console.log('watch failed on', path, 'with error', err);
	console.log('watch successful on', path);
}

watchr.open(path, listener, next);
