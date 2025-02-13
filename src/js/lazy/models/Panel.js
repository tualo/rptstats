Ext.define('Tualo.rptstats.lazy.models.Panel', {
    extend: 'Ext.app.ViewModel',
    alias: 'viewmodel.lazy_rptstats',
    data: {
        saving: false,
        initialized: false,
        record: null,
        config: null
    },
    formulas: {
        disabled: function (get) {
            return Ext.isEmpty(get('record')) || get('saving');
        }
    }
});