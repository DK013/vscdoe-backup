# vscode-backup README

## Features

Backup/Restore VSCode User Settings and Plugins

## Download from Marketplace

Download : [Link to Marketplace](https://marketplace.visualstudio.com/items?itemName=Westenets.vscode-backup)

## Requirements

Visual Studio Code must be added to `path` for this plugin to work

**How to add vscode to path:**

On Windows and Linux the `code` command should be installed automatically. On macOS, it needs to be installed manually:

Launch VS Code. Now open the Command Palette (F1) and type `shell command` to find the `Shell Command: Install 'code' command in PATH` command. Restart your terminal.

## Usage

~~The Extaintion runs every time vscode starts and runs `vscode-backup.backup` command by detault.~~

For a bug reported where the plugin replaces the backup before importing, we disabled the autorun for now. It'll be enabled later on.

Or can be accessed manually with the folowing commands:

`vscode-backup.backup`: Backs up user settings and installed plugins list in a zip file to the document folder.

`vscode-backup.restore`: Restores user settings and Installs all plugins listed in the backup file from the zip located in Documents folder.

`vscode-backup.open-directory`: Opens the Document folder in File Explorer to locate the `vs_backup.zip` file.

## Known Issues

### Failed to Install Extension

Some Extensions in visual studio marketplace has different package id than what they register in system after install. Sice this plugin doesn't copy any existing extension file from one system to anoteher for privacy and security reasons and install everything from marketplace in the new system, some extensions might fail to install in the newer system if they have different package id in the marketplace. e.g. `ms-vscode.csharp` has the id `ms-dotnettools.csharp` in the marketplace.

Workaround: Check the output log and install the failed to install extensions manually

### open-directory command not working in Linux

Some may encounter this issue in Ubuntu. Though it's been tested in Ubuntu 18 and it works, some prior versions may fail to run this command.
It's also tested in all Arch linux flavours and works.
Since there're countless linux distros, it's impossible for us to test in every environmet. So if anybody encounters this issue in their linux distro please let us know.

### Backup file got replaced 

For a bug reported where the plugin replaces the backup before importing, we disabled the autorun for now. It'll be enabled later on.

Cehck Issue: [#1](https://github.com/DK013/vscdoe-backup/issues/1) for details.

## OS Support

Windows, macOS, Linux

## Contributing

Clone the repository `git clone https://github.com/DK013/vscdoe-backup.git`

**Build**

Install Node-Modules: `npm install`

Build: `npm run build`


## Release Notes

### 0.0.6

Multi-Pltform Backup/Restore 
Backup package from one platform can be used to restore on another platform.

### 0.0.5

Linux Support Added  
Some House Cleaning  
*Check [Known Issues](README.md##known-issues) for possible problems in different environment

### 0.0.4

macOS support added

### 0.0.3

New Zip Library for macOS Support  
macOS tests started

### 0.0.2

Added Icons and Manifest for Marketplace

### 0.0.1

Initial release of vscode backup for Windows

**Enjoy!**
