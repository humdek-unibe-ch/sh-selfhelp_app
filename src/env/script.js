var fs = require('fs')
var path = require('path');
function copyEnvFileSync() {
    var fileData = fs.readFileSync(path.join('./configs/config.ts'), 'utf-8')
    fs.writeFileSync('./sh-selfhelp_app/src/env/app.config.ts', fileData, 'utf-8');
    console.log('Environment file copied successfully')
}
copyEnvFileSync();
