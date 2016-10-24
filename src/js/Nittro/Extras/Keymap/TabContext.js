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

        destroy: function () {
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

            this._.items = this._.handlers = this._.disabled = null;

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
