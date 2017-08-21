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
const isNotWhitelisted = (obj) => !whitelist.errors.includes(JSON.stringify(obj));
const countWhitelisted = (errs, total) => errs ? ` (${total.length - errs.length} suppressed by whitelist)` : '';
const countErrors = (errs, total) => `Found ${errs.length} error${errs.length > 1 ? 's' : ''}${countWhitelisted(errs, total)}`;

const parseOutput = ({errors}) => {
    errors = errors.filter(i => i.level === 'error'); // Ignore warnings

    const errorsNotInWhitelist = errors
        .filter(isNotWhitelisted);

    return {
        total: errors,
        countStr: countErrors(errorsNotInWhitelist, errors),
        errors: errorsNotInWhitelist
    };
};


function errorsToChoices(errors) {
    return errors.map(e => {
        const name = formatJson(e);
        return {
            name,
            value: e,
            short: name
        };
    });
}

const fail = (message) => {
    console.error(message);
    process.exit(1);
};

const checkIfFailure = (input) => {
    const {errors, countStr, total} = input;
    if (errors.length) {
        const errsStr = errors.map(formatJson).join('\n');
        fail(`${errsStr}\n✘ ${countStr}`);
    } else {
        console.log(`✓ No errors!${countWhitelisted(errors, total)}`);
        process.exit(0);
    }
};

function formatMessage(msg) {
    return `${msg.descr || ''}`;
}

function formatJson(obj) {
    const paths = [...new Set(obj.message.map(i => i.path).filter(Boolean))];
    return `${obj.message.map(formatMessage).join(' ')}\n${paths.join('\n')}\n\n`;
}

module.exports = {
    findLineBreaksInColouredOutput,
    isFlowError,
    isNotWhitelisted,
    countWhitelisted,
    countErrors,
    parseOutput,
    fail,
    checkIfFailure,
    formatJson,
    errorsToChoices
};
