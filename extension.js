// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const sh = require('shelljs');
const Shell = require('node-powershell');
const fs = require('fs');
const path = require('path');
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
	Output.appendLine('Congratulations, your extension "vscode-backup" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let command1 = vscode.commands.registerCommand('extension.backup', function () {
		// The code you place here will be executed every time your command is executed
		if(process.platform === "win32") {
			ps.addCommand('code --list-extensions | % { "code --install-extension $_ " }');
			ps.invoke()
			.then(output => {
				fs.writeFile(path.join(folderPath, 'plugins.ps1'), output, error => {
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
		else if(process.platform === 'darwin'){
			sh.exec('code --list-extensions | xargs -L 1 echo code --install-extension', (code, output) => {
				fs.writeFile(path.join(folderPath, 'plugins.txt'), output, error => {
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
					vscode.window.showErrorMessage('Failed to install extainsions');
				});
				child.on("exit",function(){
					Output.appendLine("Script finished");
					vscode.window.showInformationMessage('Extaintions Imported. Check Output for Details');
				});
				child.stdin.end(); //end input
			}
			else if(process.platform === 'darwin') {
				fs.readFile(path.join(folderPath, 'plugins.txt'), function(err, data) {
					if(err) {
						vscode.window.showErrorMessage('Failed to Read Plugins List');
					}
					else {
						sh.exec(data.toString(), (code, output) => {
							console.log(code);
							console.log(output);
							Output.appendLine(output);
						});
					}
				});
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
	});

	context.subscriptions.push(command1, command2, command3);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function archive(mode = 'create') {  //implemet node-zip after mac test
	if(mode === 'create') {
		var error = 0;
		// @ts-ignore
		var zip = new require('node-zip')();
		if(process.platform === 'win32') {
			fs.readFile(path.join(folderPath, 'plugins.ps1'), (err, data)=>{
				if(err) {
					Output.appendLine(err.toString());
					error++;
				}
				else {
					zip.file('plugins.ps1', data);
				}
			});
			fs.readFile(path.join(folderPath, 'settings.json'), (err, data)=>{
				if(err) {
					Output.appendLine(err.toString());
					error++;
				}
				else {
					zip.file('settings.json', data);
				}
			});
		}
		else if(process.platform === 'darwin') {
			fs.readFile(path.join(folderPath, 'plugins.txt'), (err, data)=>{
				if(err) {
					Output.appendLine(err.toString());
					error++;
				}
				else {
					zip.file('plugins.txt', data);
				}
			});
			fs.readFile(path.join(folderPath, 'settings.json'), (err, data)=>{
				if(err) {
					Output.appendLine(err.toString());
				}
				else {
					zip.file('settings.json', data);
				}
			});
			
		}
		
		
		setTimeout(()=>{
			if(error === 0) {
				var data = zip.generate({ base64:false, compression: 'DEFLATE' });
				fs.writeFileSync(path.join(documents, 'vs_backup.zip'), data, 'binary');
				vscode.window.showInformationMessage('Backup File Created');
			}
			else {
				vscode.window.showErrorMessage('Failed to create Backup File. See Output for more details');
			}
		}, 2000);
	}
	else if(mode === 'extract') {
		var file = fs.readFileSync(path.join(documents, 'vs_backup.zip'));
		// @ts-ignore
		var zip = new require('node-zip')(file, {base64: false, checkCRC32: true});
		fs.writeFileSync(path.join(folderPath, 'settings.json'), zip.files['settings.json']._data);
		if(process.platform === 'win32') {
			fs.writeFileSync(path.join(folderPath, 'plugins.ps1'), zip.files['plugins.ps1']._data);
		}
		else if(process.platform === 'darwin') {
			fs.writeFileSync(path.join(folderPath, 'plugins.txt'), zip.files['plugins.txt']._data);
		}
		vscode.window.showInformationMessage('User Settings Imported Successfully');
		vscode.window.showWarningMessage('Installing Plugins. Do Not Close the Window. Check Output log for details.');
	}
}
module.exports = {
	activate,
	deactivate
}
