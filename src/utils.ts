import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import * as child_process from 'child_process';

export async function testIfPathIsBlender(filepath: string) {
    let name: string = path.basename(filepath);

    if (!name.toLowerCase().startsWith('blender')) {
        return Promise.reject(new Error('Expected executable name to begin with \'blender\''));
    }

    let testString = '###TEST_BLENDER###';
    let command = `"${filepath}" --factory-startup -b --python-expr "import sys;print('${testString}');sys.stdout.flush();sys.exit()"`;

    return new Promise<void>((resolve, reject) => {
        child_process.exec(command, {}, (err, stdout, stderr) => {
            let text = stdout.toString();
            if (!text.includes(testString)) {
                var message = 'A simple check to test if the selected file is Blender failed.';
                message += ' Please create a bug report when you are sure that the selected file is Blender 2.8 or newer.';
                message += ' The report should contain the full path to the executable.';
                reject(new Error(message));
            }
            else {
                resolve();
            }
        });
    });
}