# vscode-backup README

## Features

Backup/Restore VSCode User Settings and Plugins

## Download from Marketplace

Download : [Link to Marketplace](https://marketplace.visualstudio.com/items?itemName=Westenets.vscode-backup)

## Requirements

Visual Studio Code must be added to path for this plugin to working

**How to add vscode to path:**

On Windows and Linux the `code` command should be installed automatically. On macOS, it needs to be installed manually:

Launch VS Code. Now open the Command Palette (F1) and type `shell command` to find the `Shell Command: Install 'code' command in PATH` command. Restart your terminal.

## Usage

The Extaintion runs every time vscode starts

Or can be accessed manually with the folowing commands:

`vscode-backup.backup`: Backs up user settings and installed plugins list in a zip file to the document folder.

`vscode-backup.restore`: Restores user settings and Installs all plugins listed in the backup file from the zip located in Documents folder.

`vscode-backup.open-directory`: Opens the Document folder in File Explorer to locate the `vs_backup.zip` file.

## OS Support

Windows Only.
Other OS Support coming soon

## Contributing

Clone the repository `git clone https://github.com/DK013/vscdoe-backup.git`

**Build**

Install Node-Modules: `npm install`

Build: `npm run build`


## Release Notes

### 0.0.3

New Zip Library for macOS Support
macOS tests started

### 0.0.2

Added Icons and Manifest for Marketplace

### 0.0.1

Initial release of vscode backup for Windows

**Enjoy!**
