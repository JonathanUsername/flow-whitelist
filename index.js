#!/usr/bin/env node
/* @noflow */
/* global module */

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
    .option('-p --pattern [regex]', 'Add all matching errors to whitelist')
    .parse(process.argv);

npm.load({}, (err) => {
    if (err) {
        return process.stderr.write(err);
    }

    const prefix = npm.prefix;
    const flow = new FlowProcess(prefix);

    if (program.remove) {
        prompt.removeErrors(whitelist.errors);
    } else if (program.add) {
        flow.check().then(parseOutput).then(prompt.addError);
    } else if (program.pattern) {
        flow.check().then(parseOutput).then(prompt.patternMatch);
    } else {
        flow.check().then(parseOutput).then(checkIfFailure).catch(fail);
    }
});

module.exports = {
    program
};
