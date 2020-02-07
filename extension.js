// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const sh = require('shelljs');
const Shell = require('node-powershell');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const Output = vscode.window.createOutputChannel('Vscode Backup');
 
const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});
const folderPath = path.join(process.env.APPDATA, 'Code\\User');
const documents = path.join(process.env.USERPROFILE, 'Documents');

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
				// output = output.split('\n').join(';');
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
		else {
			sh.exec('code --list-extensions | xargs -L 1 echo code --install-extension', (code, output) => {
				vscode.window.showInformationMessage(output);
			});
		}
		
	});

	let command2 = vscode.commands.registerCommand('extension.restore', function () {
		// The code you place here will be executed every time your command is executed
		archive('extract');
		setTimeout(()=>{
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
		},1000);
	});

	context.subscriptions.push(command1, command2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

function archive(mode = 'create') {
	if(mode === 'create') {
		var zip = new AdmZip();
		zip.addLocalFile(path.join(folderPath, 'plugins.ps1'));
		zip.addLocalFile(path.join(folderPath, 'settings.json'));
		zip.writeZip(path.join(documents, 'vs_backup.zip'));
		vscode.window.showInformationMessage('Backup File Created');
		// require('child_process').exec('start "" "'+documents+'"');
	}
	else if(mode === 'extract') {
		var zip = new AdmZip(path.join(documents, 'vs_backup.zip'));
		zip.extractAllTo(folderPath, true);
		vscode.window.showInformationMessage('User Settings Imported Successfully');
	}
}
module.exports = {
	activate,
	deactivate
}
