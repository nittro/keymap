_context.invoke('Nittro.Extras.Keymap', function () {

    var Keymap = _context.extend(function() {
        this._ = {
            map: {}
        };
    }, {
        STATIC: {
            MAC: /mac/i.test(navigator.platform),
            ACTION: 'Control'
        },

        add: function (key, handler) {
            key = key.replace(/\baction\b/ig, Keymap.ACTION);
            this._.map[key] = handler;
            return this;
        },

        remove: function (key) {
            delete this._.map[key];
        },

        get: function (key) {
            return this._.map[key] || null;
        }
    });

    if (Keymap.MAC) {
        Keymap.ACTION = 'Meta';
    }

    _context.register(Keymap, 'Keymap');

}, {

});
;
_context.invoke('Nittro.Extras.Keymap', function (Arrays, DOM, undefined) {

    var TabContext = _context.extend('Nittro.Object', function() {
        TabContext.Super.call(this);

        this._.items = [];
        this._.handlers = [];
        this._.disabled = [];
        this._.lastFocused = null;

    }, {
        add: function (items) {
            if (!Array.isArray(items)) {
                items = Arrays.createFrom(arguments);
            }

            return this.insert(items);

        },

        remove: function (items) {
            if (!Array.isArray(items)) {
                items = Arrays.createFrom(arguments);
            }

            items.forEach(function (item) {
                var index = this._.items.indexOf(item);

                if (index > -1) {
                    if (item instanceof Element) {
                        DOM.removeListener(item, 'focus', this._.handlers[index]);

                    } else if (typeof item.off === 'function') {
                        item.off('focus', this._.handlers[index]);

                    }

                    this._.items.splice(index, 1);
                    this._.handlers.splice(index, 1);
                    this._.disabled.splice(index, 1);

                    if (this._.lastFocused >= index) {
                        this._.lastFocused--;
                    }
                }
            }.bind(this));

            if (this._.lastFocused && this._.lastFocused < 0) {
                this._.lastFocused = null;
            }

            return this;
        },

        insert: function (items, index) {
            if (!Array.isArray(items)) {
                items = [items];
            }

            if (index === undefined) {
                index = this._.items.length;
            }

            var handlers = [],
                disabled = [];

            items.forEach(function (item) {
                if (typeof item.focus !== 'function') {
                    throw new TypeError("Invalid item: doesn't have a focus() method");
                }

                var handler = null,
                    dis = !!item.disabled;

                if (item instanceof Element) {
                    handler = this._handleFocus.bind(this, item);
                    DOM.addListener(item, 'focus', handler);

                } else if (typeof item.on === 'function') {
                    handler = this._handleFocus.bind(this, item);
                    item.on('focus', handler);

                }

                if (typeof item.isDisabled === 'function') {
                    dis = item.isDisabled();
                }

                handlers.push(handler);
                disabled.push(dis);

            }.bind(this));

            items.unshift(index, 0);
            handlers.unshift(index, 0);
            disabled.unshift(index, 0);

            this._.items.splice.apply(this._.items, items);
            this._.handlers.splice.apply(this._.handlers, handlers);
            this._.disabled.splice.apply(this._.disabled, disabled);

            return this;

        },

        setDisabled: function(items, disabled) {
            if (!Array.isArray(items)) {
                items = [items];
            }

            if (disabled === undefined) {
                disabled = true;
            }

            items.forEach(function (item) {
                if (typeof item !== 'number') {
                    item = this._.items.indexOf(item);

                    if (item === -1) {
                        return;
                    }
                }

                this._.disabled[item] = disabled;

            }.bind(this));

            return this;

        },

        focus: function () {
            if (this._.items.length) {
                this._.lastFocused = 0;

                while (this._.disabled[this._.lastFocused]) {
                    this._.lastFocused++;

                    if (this._.lastFocused >= this._.items.length) {
                        this._.lastFocused = null;
                        return;
                    }
                }

                this._.items[this._.lastFocused].focus();
                this.trigger('focus');

            }
        },

        next: function (cycle) {
            var count = this._.items.length;

            if (!count) {
                return;
            }

            var index = this._.lastFocused,
                start = index,
                cycled = false;

            if (index === null) {
                index = -1;
                start = 0;

            } else if (this._.items[index] instanceof TabContext && this._.items[index].next(false)) {
                return true;

            }

            do {
                index++;

                if (index >= count) {
                    if (cycle === false) {
                        return false;
                    } else {
                        index %= count;
                        cycled = true;
                    }
                } else if (cycled && index >= start) {
                    return false;

                }
            } while (this._.disabled[index]);

            this._.lastFocused = index;
            this._.items[index].focus();
            return true;

        },

        prev: function (cycle) {
            var count = this._.items.length;

            if (!count) {
                return;
            }

            var index = this._.lastFocused,
                start = index,
                cycled = false;

            if (index === null) {
                index = this._.items.length;
                start = index - 1;

            } else if (this._.items[index] instanceof TabContext && this._.items[index].prev(false)) {
                return true;

            }

            do {
                index--;

                if (index < 0) {
                    if (cycle === false) {
                        return false;
                    } else {
                        index += count;
                        cycled = true;
                    }
                } else if (cycled && index <= start) {
                    return false;

                }
            } while (this._.disabled[index]);

            this._.lastFocused = index;
            this._.items[index].focus();
            return true;
        },

        clear: function () {
            this._.items.forEach(function (item, index) {
                if (item instanceof Element) {
                    DOM.removeListener(item, 'focus', this._.handlers[index]);

                } else if (typeof item.off === 'function') {
                    item.off('focus', this._.handlers[index]);

                }

                if (item instanceof TabContext) {
                    item.destroy();
                }
            }.bind(this));

            this._.items = [];
            this._.handlers = [];
            this._.disabled = [];
            this._.lastFocused = null;
            return this;
        },

        destroy: function () {
            return this.clear();
        },

        _handleFocus: function (item) {
            this._.lastFocused = this._.items.indexOf(item);
        }
    });

    _context.register(TabContext, 'TabContext');

}, {
    Arrays: 'Utils.Arrays',
    DOM: 'Utils.DOM'
});
;
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
;
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
