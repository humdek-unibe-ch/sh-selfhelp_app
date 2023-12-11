var fs = require('fs')
var path = require('path');
function copyEnvFileSync() {
    var fileData = fs.readFileSync(path.join('./config.ts'), 'utf-8')
    fs.writeFileSync('./SelfHelpMobile/src/env/app.config.ts', fileData, 'utf-8');
    console.log('Environment file copied successfully')
}
copyEnvFileSync();
