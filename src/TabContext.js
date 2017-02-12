_context.invoke('Nittro.Extras.Keymap', function (Arrays, DOM, undefined) {

    var anonId = 0;

    var TabContext = _context.extend('Nittro.Object', function() {
        TabContext.Super.call(this);

        this._.items = [];
        this._.handlers = [];
        this._.lastFocused = null;

    }, {
        add: function (items) {
            if (!Array.isArray(items)) {
                items = Arrays.createFrom(arguments);
            }

            return this.insert(items);

        },

        addFromContainer: function (container, links, index) {
            var elements = Arrays.createFrom(container.getElementsByTagName('input'))
                .concat(Arrays.createFrom(container.getElementsByTagName('select')))
                .concat(Arrays.createFrom(container.getElementsByTagName('textarea')))
                .concat(Arrays.createFrom(container.getElementsByTagName('button')));

            if (links) {
                elements = elements.concat(Arrays.createFrom(container.getElementsByTagName('a')));
            }

            var radios = {};

            elements = elements.filter(function (elem) {
                if (elem.tagName === 'INPUT' && elem.type === 'radio') {
                    if (radios[elem.name]) {
                        return false;
                    } else {
                        radios[elem.name] = true;
                    }
                }

                return elem.tabIndex !== -1;
            });

            elements.sort(function (a, b) {
                if (a.tabIndex > 0 && b.tabIndex > 0) {
                    return a.tabIndex - b.tabIndex || ((a.compareDocumentPosition(b) & 4) ? -1 : 1);
                } else if (a.tabIndex > 0) {
                    return -1;
                } else if (b.tabIndex > 0) {
                    return 1;
                } else {
                    return (a.compareDocumentPosition(b) & 4) ? -1 : 1;
                }
            });

            return this.insert(elements, index);
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

            if (typeof index !== 'number') {
                index = this._.items.length;
            }

            var handlers = [];

            items = items.map(function (item) {
                if (typeof item.focus !== 'function') {
                    throw new TypeError("Invalid item: doesn't have a focus() method");
                }

                var handler = null,
                    id = null;

                if (item instanceof Element) {
                    if (!item.hasAttribute('id')) {
                        item.setAttribute('id', 'tabContext-item' + (++anonId));
                    }

                    id = item.getAttribute('id');
                    handler = this._handleFocus.bind(this, id);
                    DOM.addListener(item, 'focus', handler);

                } else if (typeof item.on === 'function') {
                    handler = this._handleFocus.bind(this, item);
                    item.on('focus', handler);
                }

                handlers.push(handler);
                return id || item;

            }.bind(this));

            items.unshift(index, 0);
            handlers.unshift(index, 0);

            this._.items.splice.apply(this._.items, items);
            this._.handlers.splice.apply(this._.handlers, handlers);

            return this;

        },

        isDisabled: function () {
            return this._.items.some(function (item, index) {
                return this._getItem(item) && this._isDisabled(index);
            }.bind(this));
        },

        focus: function () {
            if (this._.items.length) {
                this._.lastFocused = 0;

                while (this._isDisabled(this._.lastFocused)) {
                    this._.lastFocused++;

                    if (this._.lastFocused >= this._.items.length) {
                        this._.lastFocused = null;
                        return;
                    }
                }

                this._.items[this._.lastFocused].focus();

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
            } while (this._isDisabled(index));

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
            } while (this._isDisabled(index));

            this._.lastFocused = index;
            this._.items[index].focus();
            return true;
        },

        clear: function () {
            this._.items.forEach(function (item, index) {
                if (typeof item === 'string') {
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
            this._.lastFocused = null;
            return this;
        },

        destroy: function () {
            return this.clear();
        },

        _getItem: function (item) {
            return typeof item === 'string' ? DOM.getById(item) : item;
        },

        _isDisabled: function (index) {
            var item = this._getItem(this._.items[index]);

            if (!item) {
                return true;
            }

            return item instanceof Element ? item.disabled : (typeof item.isDisabled === 'function' ? item.isDisabled() : false);
        },

        _handleFocus: function (item) {
            this._.lastFocused = this._.items.indexOf(item);
            this.trigger('focus');
        }
    });

    _context.register(TabContext, 'TabContext');

}, {
    Arrays: 'Utils.Arrays',
    DOM: 'Utils.DOM'
});
