Ext.define('Tualo.rptstats.lazy.Panel', {
    extend: "Ext.form.Panel",
    requires: [
        'Tualo.rptstats.lazy.controller.Panel',
        'Tualo.rptstats.lazy.models.Panel'
    ],
    bodyPadding: 10,

    controller: 'lazy_rptstats',
    viewModel: {
        type: 'lazy_rptstats'
    },
    bind: {
        disabled: "{disabled}"
    },
    config: {
        record: null,
    },
    bodyPadding: 10,
    layout: {
        type: 'vbox',
        align: 'stretch'
    },

    dockedItems: [

    ],

    items: [

    ],
    loadRecord: function (record) {
        this.getController().loadRecord(record);
    }
});