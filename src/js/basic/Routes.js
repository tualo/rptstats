Ext.define('Tualo.routes.RPTStats', {
    statics: {
        load: async function () {
            return [
                {
                    name: 'rptstats_fa_1',
                    path: '#rptstats/fa/1'
                }
            ]
        }
    },
    requires: [
        'Tualo.report.data.field.SinglePrice',
        'Tualo.report.data.field.NetPrice',
        'Tualo.report.data.field.Account',
    ],
    url: 'rptstats/:type/:id',
    handler: {
        action: function (type, id) {
            /*
            type = 'views';
            let tablenamecase = tablename.toLocaleUpperCase().substring(0, 1) + tablename.toLowerCase().slice(1);
            console.log('Tualo.DataSets.' + type + '.' + tablenamecase, arguments);
            let opt = {};
            if (typeof id != 'undefined') {
                opt.loadId = id;
            }
            Ext.getApplication().addView('Tualo.report.lazy.ReportPanel', {
                type: type,
                reportnumber: id
            });
            */

        },
        before: function (type, id, action) {

            /*
            console.log('Tualo.routes.Cmp_ds', arguments, 'reject');
            action.stop();
            let tablenamecase = tablename.toLocaleUpperCase().substring(0,1) + tablename.toLowerCase().slice(1);
            let id = null;
            if (typeof xid.resume=='function'){ action=xid; }else{ id = xid;}
            action.resume();
            */
        }
    }
});

Ext.Loader.setPath('Tualo.rptstats.lazy', './jsrptstats');
Ext.Loader.setPath('Tualo.rptstats.data.field', './jsrptstats');
