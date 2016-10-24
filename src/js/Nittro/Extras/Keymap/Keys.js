_context.invoke('Nittro.Extras.Keymap', function () {

    var Keys = {
        modifiers: {
            Shift: 'shiftKey',
            Control: 'ctrlKey',
            Alt: 'altKey',
            Meta: 'metaKey'
        },
        modifierOrder: [
            'Control',
            'Alt',
            'Shift',
            'Meta'
        ],
        codes: {
            8: 'Backspace',
            9: 'Tab',
            13: 'Enter',
            16: 'Shift',
            17: 'Control',
            18: 'Alt',
            27: 'Escape',
            32: 'Space',
            33: 'PageUp',
            34: 'PageDown',
            35: 'End',
            36: 'Home',
            37: 'ArrowLeft',
            38: 'ArrowUp',
            39: 'ArrowRight',
            40: 'ArrowDown',
            45: 'Insert',
            46: 'Delete',
            91: 'Meta',
            93: 'Meta',
            186: ';',
            187: '=',
            188: ',',
            189: '-',
            190: '.',
            191: '/',
            192: '`',
            219: '[',
            220: '\\',
            221: ']',
            222: "'",
            224: 'Meta',
            225: 'AltGraph'
        }
    };

    var i;

    for (i = 0; i < 10; i++) {
        Keys.codes[i + 48] = i + '';
    }

    for (i = 65; i < 91; i++) {
        Keys.codes[i] = String.fromCharCode(i);
    }

    _context.register(Keys, 'Keys');

});
