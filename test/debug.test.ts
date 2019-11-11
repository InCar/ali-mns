import assert = require("assert");

const XmlBuilder = require('xmlbuilder');

describe('debug', () => {
    it('convert string to xml', () => {
        const res = XmlBuilder.create('hello').toString()
        assert(res === '<hello/>');
    })
})
