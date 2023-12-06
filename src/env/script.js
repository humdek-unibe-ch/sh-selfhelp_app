var fs = require('fs')
var path = require('path');
function copyEnvFileSync() {
    var env = process.env.NODE_ENV
    if (!process.env.NODE_ENV) {
        env = "selfhelp-dev"
    }
    var fileData = fs.readFileSync(path.join(__dirname, './../../projects/' + env.trim() + '/config.ts'), 'utf-8')
    fs.writeFileSync('src/env/project.config.ts', fileData, 'utf-8');
    console.log('Environment file copied successfully')
}
copyEnvFileSync();
