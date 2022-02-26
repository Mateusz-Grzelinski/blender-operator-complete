import * as vscode from 'vscode';
import { BlenderOperatorAutocomplete, getBlenderOperators } from './complete';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('blender-operator-complete.get_blender_operators', getBlenderOperators)
	);

	const selector: vscode.DocumentSelector = [
		{
			pattern: '**/*.py',
		},
	];
	context.subscriptions.push(
		vscode.languages.registerCompletionItemProvider(
			selector,
			new BlenderOperatorAutocomplete(),
			'.',
			// "'",
			// '"'
		),
	);
}

// this method is called when your extension is deactivated
export function deactivate() { }
