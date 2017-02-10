_context.invoke('Nittro.Extras.Keymap.Bridges.KeymapDI', function () {

    var KeymapExtension = _context.extend('Nittro.DI.BuilderExtension', function (containerBuilder, config) {
        KeymapExtension.Super.call(this, containerBuilder, config);
    }, {
        load: function () {
            var builder = this._getContainerBuilder();

            builder.addServiceDefinition('keymapManager', 'Nittro.Extras.Keymap.Manager()');
            builder.addFactory('keymap', 'Nittro.Extras.Keymap.Keymap()');
            builder.addFactory('tabContext', 'Nittro.Extras.Keymap.TabContext()');

        }
    });

    _context.register(KeymapExtension, 'KeymapExtension');

});
