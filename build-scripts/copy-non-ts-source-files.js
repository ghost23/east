/**
 * Created by mail on 07.12.2016.
 */

const copyFiles = require('copyfiles');

function copyNonTSSourceFiles() {
	copyFiles(['./src/**/*.html', './src/**/*.css', './out'], 1, () => {});
}

if (require.main === module) {
	copyNonTSSourceFiles();
}

module.exports = copyNonTSSourceFiles;
