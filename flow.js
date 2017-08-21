/* global module */

const child = require('child_process');
const {fail} = require('./utils');
const path = require('path');

class FlowProcess {
    constructor(npmPrefix) {
        if (!npmPrefix) {
            throw new Error('No path provided to flow');
        }
        this.path = path.join(npmPrefix, 'node_modules/.bin/flow');
        this.npmPrefix = npmPrefix;
    }
    _run(args) {
        return new Promise((resolve) => {
            const flow = child.spawn(this.path, args, {
                cwd: this.npmPrefix,
                stdio: ['pipe', 'pipe', 'inherit'] // stdio FDs. inherit stderr.
            });
            flow.stdout.setEncoding('utf8');
            var output = '';
            flow.stdout.on('data', (chunk) => {
                output += chunk;
            });
            flow.stdout.on('close', () => {
                resolve(output);
            });
        }).catch(fail);
    }
    json() {
        return this._run(['--json', '--show-all-errors']).then(str => {
            const json = JSON.parse(str);
            return json;
        });
    }
    check() {
        return this._run(['--color', 'always', '--show-all-errors']);
    }
}

module.exports = FlowProcess;
