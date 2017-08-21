// @flow
/* global module */
const fs = require('fs');
const path = require('path');

const DIR_OF_SCRIPT = __dirname;
const WHITELIST_FILE = path.join(DIR_OF_SCRIPT, './.flow-error-whitelist.json');

class Whitelist {
    constructor() {
        if (!fs.existsSync(WHITELIST_FILE)) {
            this._write();
        }
        const file = require(WHITELIST_FILE);
        this._errors = file.errors.concat(); // Clone array
    }
    get errors() {
        return this._errors;
    }
    set errors(errors) {
        this._errors = errors;
        this._write(errors);
    }
    _write(errors) {
        errors = errors || [];
        const jsonStr = JSON.stringify({errors});
        fs.writeFileSync(WHITELIST_FILE, jsonStr);
    }
    add(err) {
        if (Array.isArray(err)) {
            this.errors = [...this._errors, ...err];
        } else {
            this.errors = [...this._errors, err];
        }
    }
}

const whitelist = new Whitelist();

module.exports = {
    whitelist
};
