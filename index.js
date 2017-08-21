#!/usr/bin/env node
/* @noflow */

const program = require('commander');
const npm = require('npm');
const FlowProcess = require('./flow');
const prompt = require('./prompt');
const {parseOutput, checkIfFailure, fail} = require('./utils');
const {whitelist} = require('./whitelist');


// TODO: make single interface same as flow, so it's a drop-in replacement for use with IDEs etc - will require storing JSON as well....

program
    .option('-a --add', 'Add rules to whitelist')
    .option('-r --remove', 'Remove rules from whitelist')
    .option('-g --global', 'Use global Flow')
    .option('-j --json', 'Use JSON output')
    .option('-p --pattern [regex]', 'Add all matching errors to whitelist')
    .parse(process.argv);

npm.load({}, (err) => {
    if (err) {
        return process.stderr.write(err);
    }


    const prefix = npm.prefix;
    const flow = new FlowProcess(prefix);

    if (program.args[0] === 'coverage') {
        flow._run(process.argv.slice(2)).then(console.log);
    } else if (program.remove) {
        prompt.removeErrors(whitelist.errors);
    } else if (program.add) {
        flow.json().then(parseOutput).then(prompt.addError);
    } else if (program.json) {
        flow.json().then(parseOutput).then(i => i.errors).then(console.log).catch(fail);
    } else if (program.pattern) {
        flow.json().then(parseOutput).then((errors) => {
            prompt.patternMatch(errors, program.pattern);
        });
    } else {
        flow.json().then(parseOutput).then(checkIfFailure).catch(fail);
    }
});
