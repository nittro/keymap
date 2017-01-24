_context.invoke('Nittro.Extras.Keymap', function (DOM, Keymap, TabContext, Keys) {

    var Manager = _context.extend(function() {
        this._ = {
            keymaps: [],
            tabContexts: []
        };

        DOM.addListener(document, 'keydown', this._handleKeyDown.bind(this));
        DOM.addListener(document, 'keyup', this._handleKey.bind(this));
        DOM.addListener(document, 'keypress', this._handleKey.bind(this));

    }, {
        STATIC: {
            RE_TAB: /^(?:Shift\+)?Tab$/
        },

        push: function (map) {
            for (var a = 0; a < arguments.length; a++) {
                if (!arguments[a]) {
                    // noop
                } else if (arguments[a] instanceof Keymap) {
                    this._.keymaps.unshift(arguments[a]);
                } else if (arguments[a] instanceof TabContext) {
                    this._.tabContexts.unshift(arguments[a]);
                } else {
                    throw new TypeError('Invalid argument, must be an instance of Keymap or TabContext');
                }
            }

            return this;
        },

        pop: function (map) {
            var target, a, i;

            for (a = 0; a < arguments.length; a++) {
                if (!arguments[a]) {
                    continue;
                } else if (arguments[a] instanceof Keymap) {
                    target = this._.keymaps;
                } else if (arguments[a] instanceof TabContext) {
                    target = this._.tabContexts;
                }

                if ((i = target.indexOf(arguments[a])) > -1) {
                    target.splice(i, 1);
                }
            }

            return this;

        },

        _handleKeyDown: function (evt) {
            if (!this._.keymaps.length && !this._.tabContexts.length) {
                return;
            }

            var key = this._extractKey(evt),
                handler;

            if (key) {
                if (this._.keymaps.length) {
                    handler = this._.keymaps[0].get(key);

                    if (handler) {
                        if (handler.call(null, key, evt) !== false) {
                            evt.preventDefault();
                        }

                        return;
                    }
                }

                if (this._.tabContexts.length && Manager.RE_TAB.test(key)) {
                    evt.preventDefault();

                    if (key === 'Tab') {
                        this._.tabContexts[0].next();

                    } else {
                        this._.tabContexts[0].prev();

                    }
                }
            }
        },

        _handleKey: function (evt) {
            if (this._.keymaps.length || this._.tabContexts.length) {
                var key = this._extractKey(evt);

                if (this._.keymaps.length && this._.keymaps[0].get(key) || this._.tabContexts.length && Manager.RE_TAB.test(key)) {
                    evt.preventDefault();
                }
            }
        },

        _extractKey: function (evt) {
            var key = Keys.codes[evt.which || evt.keyCode];

            if (key) {
                if (key in Keys.modifiers) {
                    return key;

                } else {
                    var modifiers = [];

                    Keys.modifierOrder.forEach(function (modifier) {
                        if (evt[Keys.modifiers[modifier]]) {
                            modifiers.push(modifier);
                        }
                    });

                    modifiers.push(key);
                    return modifiers.join('+');

                }
            }
        }
    });

    _context.register(Manager, 'Manager');

}, {
    DOM: 'Utils.DOM'
});
