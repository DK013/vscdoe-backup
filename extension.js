// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const sh = require('shelljs');
const Shell = require('node-powershell');
const fs = require('fs');
const path = require('path');
 
const ps = new Shell({
  executionPolicy: 'Bypass',
  noProfile: true
});

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "vscode-backup" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let command1 = vscode.commands.registerCommand('extension.backup', function () {
		// The code you place here will be executed every time your command is executed
		if(process.platform === "win32") {
			ps.addCommand('code --list-extensions | % { "code --install-extension $_" }');
			ps.invoke()
			.then(output => {
				var folderPath = path.join(process.env.APPDATA, 'Code\\User');
				fs.writeFile(path.join(folderPath, 'plugins.txt'), output, error => {
					if(error) {
						console.log(error);
						vscode.window.showErrorMessage('Failed to create backup file');
					}
					else {
						vscode.window.showInformationMessage('Backup File Created');
					}
				});
			})
			.catch(err => {
				console.log(err);
				vscode.window.showErrorMessage('Failed to get extensions list');
			});
		}
		else {
			sh.exec('code --list-extensions | xargs -L 1 echo code --install-extension', (code, output) => {
				vscode.window.showInformationMessage(output);
			});
		}
		// Display a message box to the user
		
	});

	let command2 = vscode.commands.registerCommand('extension.restore', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Restore Command Fired');
	});

	context.subscriptions.push(command1, command2);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
