/* global module */
const inquirer = require('inquirer');
const {whitelist} = require('./whitelist');
const {countWhitelisted, fail} = require('./utils');

function addError(input) {
    const {errors, total} = input;
    if (!errors.length) {
        console.log(`✓ No errors!${countWhitelisted(errors, total)}`);
        process.exit(0);
    }

    return inquirer
        .prompt([{
            type: 'list',
            name: 'flowError',
            value: 'data',
            message: 'Choose an error to add to the whitelist',
            pageSize: 100,
            choices: errors
        }])
        .then(({flowError}) => {
            whitelist.add(flowError);
            console.log('\nAdded error to whitelist. ✨\n');
            const index = input.errors.findIndex(i => i === flowError);
            input.errors.splice(index, 1);
            addError(input);
        })
        .catch(fail);
}

function removeErrors(errors) {
    if (!errors.length) {
        console.log(`No errors in whitelist!`);
        process.exit(0);
    }

    return inquirer
        .prompt([{
            type: 'list',
            name: 'flowError',
            value: 'data',
            message: 'Choose an error to remove from whitelist',
            pageSize: 100,
            choices: errors
        }])
        .then(({flowError}) => {
            const index = errors.findIndex(i => i === flowError);
            errors.splice(index, 1);
            whitelist.errors = errors;
            console.log('\nRemoved error from whitelist. ✨\n');
            removeErrors(errors);
        });
}

function patternMatch(input, pattern) {
    const {errors, total} = input;
    if (!errors.length) {
        console.log(`✓ No errors!${countWhitelisted(errors, total)}`);
        process.exit(0);
    }
    const rx = new RegExp(pattern);
    const matching = errors.filter(i => rx.test(i));
    console.log(matching.join('\n'));

    return inquirer
        .prompt([{
            type: 'confirm',
            name: 'confirm',
            message: `Add ${matching.length} errors matching /${pattern}/ to the whitelist?`
        }])
        .then(({confirm}) => {
            if (confirm) {
                whitelist.add(matching);
                console.log(`\nAdded errors to whitelist. ${whitelist.errors.length} errors now in whitelist. ✨\n`);
            }
        })
        .catch(fail);
}

module.exports = {
    addError,
    removeErrors,
    patternMatch
};
