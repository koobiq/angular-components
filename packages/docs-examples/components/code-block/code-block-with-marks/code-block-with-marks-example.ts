import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
    type KbqCodeBlockFile,
    kbqCodeBlockHighlightJsConfigProvider,
    KbqCodeBlockModule
} from '@koobiq/components/code-block';

/**
 * @title Code-block with marks
 */
@Component({
    selector: 'code-block-with-marks-example',
    imports: [KbqCodeBlockModule],
    template: `
        <kbq-code-block lineNumbers [files]="files" />
    `,
    providers: [
        kbqCodeBlockHighlightJsConfigProvider({
            languages: {
                python: () => import('highlight.js/lib/languages/python')
            }
        })
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CodeBlockWithMarksExample {
    readonly files: KbqCodeBlockFile[] = [
        {
            filename: 'users.py',
            language: 'python',
            content: `import sqlite3

from flask import Flask, jsonify, request

app = Flask(__name__)
app.config["SECRET_KEY"] = "changeme"
db = sqlite3.connect("users.db")


@app.get("/api/users")
def find_users():
    name = request.args.get("name")
    query = f"SELECT * FROM users WHERE name = '{name}'"
    users = db.execute(query).fetchall()

    return jsonify(users)


if __name__ == "__main__":
    app.run(debug=True)`,
            markedLines: [6, [12, 14], /debug=True/],
            markedText: ["'{name}'", /"SECRET_KEY"\] = "(.*)"/]
        }
    ];
}
