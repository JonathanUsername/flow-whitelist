/* global module */
const stripAnsi = require('strip-ansi');
const {whitelist} = require('./whitelist');

const findLineBreaksInColouredOutput = (str) =>
    str.split('\n')
        .reduce((sum, i) => {
            if (stripAnsi(i)) {
                sum[sum.length - 1] += `${i}\n`;
            } else {
                sum.push('');
            }
            return sum;
        }, ['']);

const isFlowError = (str) => !!str && !/(Found [\d]+ error)|(No errors)/.test(str);
const isNotWhitelisted = (str) => !whitelist.errors.includes(str);
const countWhitelisted = (errs, total) => errs ? ` (${total.length - errs.length} suppressed by whitelist)` : '';
const countErrors = (errs, total) => `Found ${errs.length} error${errs.length > 1 ? 's' : ''}${countWhitelisted(errs, total)}`;

const parseOutput = (allErrorsStr) => {
    const allErrors = findLineBreaksInColouredOutput(allErrorsStr)
        .filter(isFlowError);

    const errorsNotInWhitelist = allErrors
        .filter(isNotWhitelisted);

    return {
        allErrorsStr,
        total: allErrors,
        countStr: countErrors(errorsNotInWhitelist, allErrors),
        errors: errorsNotInWhitelist
    };
};

const fail = (message) => {
    console.error(message);
    process.exit(1);
};

const checkIfFailure = (input) => {
    const {errors, countStr, total} = input;
    if (errors.length) {
        fail(`${errors}\n✘ ${countStr}`);
    } else {
        console.log(`✓ No errors!${countWhitelisted(errors, total)}`);
        process.exit(0);
    }
};

module.exports = {
    findLineBreaksInColouredOutput,
    isFlowError,
    isNotWhitelisted,
    countWhitelisted,
    countErrors,
    parseOutput,
    fail,
    checkIfFailure
};
