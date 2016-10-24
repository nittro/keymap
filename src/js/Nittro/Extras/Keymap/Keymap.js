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
