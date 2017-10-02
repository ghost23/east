/**
 * Created by mail on 08.12.2016.
 */
import { VIEW_MODES } from '../utils/constants';

const electron = require('electron');
const app = electron.app;
const dialog = electron.dialog;

export type AppMenuCallbacks = {
	importJavaScript: Function,
	changeView: Function
};

export default function buildAppMenu(callbacks: AppMenuCallbacks): any {

	const template: any = [
		{
			label: "File",
			submenu: [
				{
					label: "Import Javascript",
					click() {
						dialog.showOpenDialog({
							properties: ['openFile'],
							filters:[{name: 'JavaScript', extensions: ['js', 'ts']}],
							buttonLabel: 'Importieren',
							title: 'JavaScript Datei importieren'
						}, function (files: string[]) {
							callbacks.importJavaScript(files[0]); // We only allow a single file, so [0] it is.
						})
					}
				}
			]
		},
		{
			label: "Views",
			submenu: [
				{
					label: "Textual View",
					click() {
						callbacks.changeView(VIEW_MODES.TEXTUAL_VIEW)
					}
				}
			]
		},
		{
			role: 'window',
			submenu: [
				{
					role: 'minimize'
				},
				{
					role: 'close'
				}
			]
		},
		{
			role: 'help',
			submenu: [
				{
					label: 'Learn More',
					click() { electron.shell.openExternal('http://electron.atom.io') }
				}
			]
		}
	];

	if (process.platform === 'darwin') {
		template.unshift({
			label: app.getName(),
			submenu: [
				{
					role: 'about'
				},
				{
					type: 'separator'
				},
				{
					role: 'services',
					submenu: []
				},
				{
					type: 'separator'
				},
				{
					role: 'hide'
				},
				{
					role: 'hideothers'
				},
				{
					role: 'unhide'
				},
				{
					type: 'separator'
				},
				{
					role: 'quit'
				}
			]
		});
		// Window menu.
		template[3].submenu = [
			{
				label: 'Close',
				accelerator: 'CmdOrCtrl+W',
				role: 'close'
			},
			{
				label: 'Minimize',
				accelerator: 'CmdOrCtrl+M',
				role: 'minimize'
			},
			{
				label: 'Zoom',
				role: 'zoom'
			},
			{
				type: 'separator'
			},
			{
				label: 'Bring All to Front',
				role: 'front'
			}
		]
	}

	return template;
}