// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const sh = require('shelljs');
const Shell = require('node-powershell');
const fs = require('fs');
const path = require('path');
var tmp = require('tmp');
const Output = vscode.window.createOutputChannel('Vscode Backup');
 
let ps;
let folderPath = '';
let documents = '';

if(process.platform === "win32") {
	folderPath = path.join(process.env.APPDATA, 'Code\\User');
	documents = path.join(process.env.USERPROFILE, 'Documents');
	ps = new Shell({
		executionPolicy: 'Bypass',
		noProfile: true
	});
}
else if(process.platform === "darwin"){
	folderPath = path.join(process.env.HOME, "Library/Application Support/Code/User");
	documents = path.join(process.env.HOME, 'Documents');
}
else {
	folderPath = path.join(process.env.HOME, '.config/Code/User');
	documents = path.join(process.env.HOME, 'Documents');
}
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (Output.appendLine) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	Output.appendLine('Congratulations, "vscode-backup" is now active!');
	// vscode.commands.executeCommand('extension.backup');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let command1 = vscode.commands.registerCommand('extension.backup', function () {
		// The code you place here will be executed every time your command is executed
		if(process.platform === "win32") {
			ps.addCommand('code --list-extensions | % { "code --install-extension $_ " }');
			ps.invoke()
			.then(output => {
				fs.writeFile(path.join(folderPath, 'plugins'), output, error => {
					if(error) {
						Output.appendLine(error.toString());
						vscode.window.showErrorMessage('Failed to create backup file');
					}
					else {
						archive();
					}
				});
			})
			.catch(err => {
				Output.appendLine(err);
				vscode.window.showErrorMessage('Failed to get extensions list');
			});
		}
		else {
			sh.exec('code --list-extensions | xargs -L 1 echo code --install-extension', (code, output) => {
				fs.writeFile(path.join(folderPath, 'plugins'), output, error => {
					if(error) {
						Output.appendLine(error.toString());
						vscode.window.showErrorMessage('Failed to create backup file');
					}
					else {
						archive();
					}
				});
			});
		}
		
	});

	let command2 = vscode.commands.registerCommand('extension.restore', function () {
		// The code you place here will be executed every time your command is executed
		archive('extract');
		setTimeout(()=>{
			if(process.platform === "win32") {
				var spawn = require("child_process").spawn,child;
				child = spawn("powershell.exe",[path.join(folderPath, 'plugins.ps1')]);
				child.stdout.on("data",function(data){
					Output.appendLine(data);
				});
				child.stderr.on("data",function(data){
					Output.appendLine("Errors: " + data);
					vscode.window.showErrorMessage('Some Hiccups while Installing Extensions. Check Output for Details');
				});
				child.on("exit",function(){
					Output.appendLine("Script finished");
					vscode.window.showInformationMessage('Extensions Imported. Check Output for Details');
				});
				child.stdin.end(); //end input
			}
			else {
				var spawn = require("child_process").spawn,child;
				child = spawn("bash",[path.join(folderPath, 'plugins.sh')]);
				child.stdout.on("data",function(data){
					Output.appendLine(data);
				});
				child.stderr.on("data",function(data){
					Output.appendLine("Errors: " + data);
					vscode.window.showErrorMessage('Some Hiccups while Installing Extensions. Check Output for Details');
				});
				child.on("exit",function(){
					Output.appendLine("Script finished");
					vscode.window.showInformationMessage('Extensions Imported. Check Output for Details');
				});
				child.stdin.end(); //end input
			}
		},2000);
	});

	let command3 = vscode.commands.registerCommand('extension.open-directory', function () {
		if(process.platform === "win32") {
			require('child_process').exec('start "" "'+documents+'"');
		}
		else if(process.platform === "darwin") {
			require('child_process').exec('open "" "'+documents+'"');
		}
		else {
			require('child_process').exec('xdg-open "" "'+documents+'"', (error, stdout, stderr) => {
				if (error) {
					console.error(`exec error: ${error}`);
					return;
				}
				console.log(`stdout: ${stdout}`);
				console.error(`stderr: ${stderr}`);
			});
		}
	});

	context.subscriptions.push(command1, command2, command3);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function archive(mode = 'create') {  //implemet node-zip after mac test
	if(mode === 'create') {
		// @ts-ignore
		var zip = new require('node-zip')();

		zip.file('plugins', fs.readFileSync(path.join(folderPath, 'plugins')));

		if(fs.existsSync(path.join(folderPath, 'settings.json'))) {
			zip.file('settings.json', fs.readFileSync(path.join(folderPath, 'settings.json')));
		}
		// if(fs.existsSync(path.join(documents, 'vs_backup.zip'))) {
		// 	var file = fs.readFileSync(path.join(documents, 'vs_backup.zip'));
		// 	// @ts-ignore
		// 	var currentZip = new require('node-zip')(file, {base64: false, checkCRC32: true});
		// 	var currentCount, tmpobj, oldCount;
		// 	if(process.platform === 'win32') {
		// 		currentCount = Count(path.join(folderPath, 'plugins.ps1'));
		// 		tmpobj = tmp.fileSync({ prefix: 'vscode-', postfix: '.ps1' });
		// 		fs.writeFileSync(tmpobj.name, currentZip.files['plugins.ps1']._data);
		// 	}
		// 	else {
		// 		currentCount = Count(path.join(folderPath, 'plugins.sh'));
		// 		tmpobj = tmp.fileSync({ prefix: 'vscode-', postfix: '.sh' });
		// 		fs.writeFileSync(tmpobj.name, currentZip.files['plugins.sh']._data);
		// 	}
			
		// 	oldCount = Count(tmpobj.name);
		// 	if(oldCount > currentCount) {
		// 		vscode.window.showInformationMessage('The Current Backup file seems to have more stuff. Wanna oevrwite?', 'Yes', 'No')
		// 		.then(selection => {
		// 			if(selection === 'Yes') {
		// 				var data = zip.generate({ base64:false, compression: 'DEFLATE' });
		// 				fs.writeFileSync(path.join(documents, 'vs_backup.zip'), data, 'binary');
		// 				vscode.window.showInformationMessage('Backup File Created');
		// 			}
		// 			else {
		// 				vscode.window.showInformationMessage('Backup Canceled');
		// 			}
		// 		})
		// 	}
		// 	else if(oldCount < currentCount || oldCount == currentCount){
		// 		var data = zip.generate({ base64:false, compression: 'DEFLATE' });
		// 		fs.writeFileSync(path.join(documents, 'vs_backup.zip'), data, 'binary');
		// 		vscode.window.showInformationMessage('Backup File Created');
		// 	}
		// 	tmpobj.removeCallback();
		// }
		// else {
			var data = zip.generate({ base64:false, compression: 'DEFLATE' });
			fs.writeFileSync(path.join(documents, 'vs_backup.zip'), data, 'binary');
			vscode.window.showInformationMessage('Backup File Created');
		// }
		
	}
	else if(mode === 'extract') {
		var file = fs.readFileSync(path.join(documents, 'vs_backup.zip'));
		// @ts-ignore
		var zip = new require('node-zip')(file, {base64: false, checkCRC32: true});
		
		if(zip.files['settings.json']) {
			fs.writeFileSync(path.join(folderPath, 'settings.json'), zip.files['settings.json']._data);
			vscode.window.showInformationMessage('User Settings Imported Successfully');
		}

		if(process.platform === 'win32') {
			fs.writeFileSync(path.join(folderPath, 'plugins.ps1'), zip.files['plugins']._data);
		}
		else if(process.platform === 'darwin') {
			fs.writeFileSync(path.join(folderPath, 'plugins.sh'), zip.files['plugins']._data);
		}
		else {
			fs.writeFileSync(path.join(folderPath, 'plugins.sh'), zip.files['plugins']._data);
		}
		
		vscode.window.showWarningMessage('Installing Plugins. Do Not Close the Window. Check Output log for details.');
	}
}

function Count(file) {
	var i;
	var count = 0;
	fs.createReadStream(file)
	.on('data', function(chunk) {
		for (i=0; i < chunk.length; ++i)
		if (chunk[i] == 10) count++;
	})
	.on('end', function() {
		console.log(count);
		return count;
	});
}
module.exports = {
	activate,
	deactivate
}
