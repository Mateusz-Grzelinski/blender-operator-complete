import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { cacheDir, pythonFilesDir } from './paths';
import { testIfPathIsBlender } from './utils';

interface OperatorData { op: string, src: string };
let loadedJson: Array<OperatorData> | any = null;
let completions: Array<vscode.CompletionItem> | any = null;

function cacheCompletions(jsonFilePath: string) {
    getBlenderOperators();
    const fileContents = fs.readFileSync(jsonFilePath, 'utf-8');
    loadedJson = JSON.parse(fileContents);
    completions = new Array<vscode.CompletionItem>();
    for (const op of loadedJson) {
        completions.push(new vscode.CompletionItem(op.op));
    }
    return completions;
}

export class BlenderOperatorAutocomplete implements vscode.CompletionItemProvider {
    provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        let startPos = position.with(undefined, 0);
        if (position.line !== 0) {
            startPos = startPos.translate(-1);
        }
        const textBeforeCursor = document.getText(
            new vscode.Range(startPos, position)
        );
        console.log(textBeforeCursor);
        if (!textBeforeCursor.includes('operator')) {
            return [];
        }
        if (completions === null) {
            const cachedOperatorsFile = path.join(cacheDir, 'operators.json');
            console.log(cachedOperatorsFile);
            return cacheCompletions(cachedOperatorsFile);
        }
        return completions;
    }
}


export async function getBlenderOperators() {
    const codeConfiguration = vscode.workspace.getConfiguration('blender-operator-complete');
    const blenderExe: string = codeConfiguration.get("executable")!;
    console.log(`Using blender ${blenderExe}`);
    await testIfPathIsBlender(blenderExe);;
    const execution = new vscode.ProcessExecution(
        blenderExe,
        [
            '--background', '--python', path.join(pythonFilesDir, 'list_operators.py'), '--',
            '--out', path.join(cacheDir, 'operators.json')
        ]
    );
    const identifier = '123456789';
    const taskDefinition = { type: identifier };
    const name = 'List Blender operators';
    const source = 'blender-operator-complete';
    const problemMatchers: string[] = [];
    const scope = vscode.TaskScope.Workspace; // vscode.workspace.workspaceFolders![0];
    const task = new vscode.Task(taskDefinition, scope, name, source, execution, problemMatchers);
    const taskExecution = await vscode.tasks.executeTask(task);

    const p = new Promise<vscode.TaskExecution>(resolve => {
        let disposable = vscode.tasks.onDidEndTask(e => {
            if (e.execution.task.definition.type === identifier) {
                disposable.dispose();
                resolve(taskExecution);
            }
        });
    });
    p.then((val) => {
        console.log('success executing task');
    });
}

