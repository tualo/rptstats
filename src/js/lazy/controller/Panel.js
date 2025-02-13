Ext.define('Tualo.rptstats.lazy.controller.Panel', {
    extend: 'Ext.app.ViewController',
    alias: 'controller.lazy_rptstats',

    /*
    onFormFieldChanged: function (fld, oldValue, newValue) {

        let me = this, sel = null, view = this.getView();
        if (fld.name == 'referencenr') {
            console.log('onFormFieldChanged', arguments, fld.getStore().isLoaded());
            if (
                (typeof fld.picker != 'undefined') &&
                (typeof fld.picker.getSelection == 'function')
            ) {
                sel = fld.picker.getSelection();
                console.log('onFormFieldChanged !!!', arguments, fld.name);
                if ((sel.length > 0) && (sel[0].get('referencenr') != null)) {
                    if (sel[0].get('__rownumber') == 0) return;

                    view.getForm().setValues({
                        referencenr: sel[0].get('referencenr'),
                        costcenter: sel[0].get('costcenter'),
                        address: sel[0].get('address')
                    });

                }
            }
        }
    },

    getAddress: function (referencenr) {

        let flds = Ext.ComponentQuery.query('[name=referencenr]'),
            hdr = this.getView().getComponent('header').getComponent('reportheader');

        for (let i = 0; i < flds.length; i++) {
            let fld = flds[i];

            if (hdr.down(fld)) {

                let store = fld.getStore(),
                    r = store.findRecord('referencenr', referencenr, 0, false, false, true);
                if (r) {
                    console.log(r.get('address'));
                    return r.get('address');
                }
            }
        };
        return null;
    },

    loadRecord: function (record) {
        this.getViewModel().set('record', record);
        if (!Ext.isEmpty(record)) {
            if (typeof this.positionsList == 'undefined') {
                this.initializeReport();
                this.getViewModel().set('initialized', true);
            } else {
                this.reportData(
                    this.getViewModel().get('record').get('tabellenzusatz'),
                    this.getViewModel().get('record').get('id')
                );
            }
        }
    },
    getReportHeader: function () {
        return this.getView().getForm().getValues(false, false, false, true);
    },
    save: async function () {
        let view = this.getView(); o = view.getForm().getValues(false, false, false, true);
        view.setDisabled(true);
        for (let k in o) {
            if (o.hasOwnProperty(k)) {
                if (o[k] == null) delete o[k];
                if (o[k] instanceof Date) o[k] = Ext.util.Format.date(o[k], 'Y-m-d');
            }
        }
        o.texts = []

        if (this.headtextElement) {
            console.log('headtextElement', this.headtextElement, this.headtextElement.getValue())
            o.texts.push(
                {
                    type: 'head',
                    text: this.headtextElement.getValue()
                }
            )
        }

        if (this.foottextElement) {
            console.log('headtextElement', this.foottextElement, this.foottextElement.getValue())
            o.texts.push(
                {
                    type: 'foot',
                    text: this.foottextElement.getValue()
                }
            )
        }
        //        this.getView().getComponent('reportheader')

        o.positions = [];
        this.positionsList.getStore().each((item) => {

            let d = item.getData();
            if (
                d.amount != null
                && d.tax != null
            ) {
                for (let k in d) {
                    if (d.hasOwnProperty(k)) {
                        if (d[k] == null) delete d[k];
                        if (d[k] instanceof Date) d[k] = Ext.util.Format.date(d[k], 'Y-m-d');
                    }
                }
                if ((d.id == 0) && (d.amount == 0)) {
                    // ignore emtpy lines

                } else {
                    if (d.id != 0) d.__id = d.id; // keep the original pos id
                    o.positions.push(d);
                }
            }
        });



        let data = await fetch(
            './report/' + this.getViewModel().get('record').get('tabellenzusatz') + '/' + this.getViewModel().get('record').get('id'),
            {
                method: 'PUT',
                body: JSON.stringify(o)
            }
        ).then((response) => { return response.json() });
        view.setDisabled(false);
        if (data.success) {
            this.reportData(this.getViewModel().get('record').get('tabellenzusatz'), data.data.id);
            view.up().up().getViewModel().set('viewTypeOnLoad', 'form');
            view.up().up().getComponent('list').getStore().load({
                callback: function () {
                    setTimeout(() => {
                        let r = view.up().up().getComponent('list').getStore().findExact('id', data.data.id);
                        view.up().up().getComponent('list').getSelectionModel().select(r);
                    }, 500);
                }
            });
        } else {

            Ext.toast({
                html: data.msg,
                title: 'Fehler beim Speichern',
                align: 't'
            }, 2000);
        }

    },
    reportData: async function (tabellenzusatz, id) {
        let view = this.getView();
        view.getForm().reset(true);
        this.positionsList.getStore().removeAll();

        if (typeof tabellenzusatz == 'undefined') return;

        if (id < 0) {
            if (
                view.getViewModel().get('record').get('bezugsnummer') == "" ||
                view.getViewModel().get('record').get('bezugsnummer') == null) {


                view.getViewModel().get('record').set('bezugsnummer', view.getViewModel().get('record').get('kundennummer'));

            }



        }
        let config = this.getViewModel().get('config'),
            data = await fetch('./report/' + tabellenzusatz + '/' + id, {
                method: 'POST',
                body: JSON.stringify(this.getViewModel().get('record').getData())
            }).then((response) => { return response.json() });
        if (data.success) {
            let positions = [];
            let record = Ext.create('Tualo.DataSets.model.View_editor_blg_hdr_' + tabellenzusatz, data.data);

            console.log(record.data, view.getForm().getValues());

            if (Ext.isEmpty(record.data.address)) {

                record.data.address = this.getAddress(record.data.referencenr);
            }
            view.getForm().setValues(record.data);

            data.data.positions.forEach((item) => {
                let pos = { ...item };
                for (let k in config.translations.pos) {
                    let o = config.translations.pos[k][0];
                    pos[o.column_name] = item[k];
                }
                let record = Ext.create('Tualo.DataSets.model.View_editor_blg_pos_' + tabellenzusatz, pos);
                positions.push(record);
            });

            data.data.texts.forEach((item) => {
                if (item.type == 'head') {
                    if (this.headtextElement) {
                        this.headtextElement.setValue(item.text);
                    }
                }
                if (item.type == 'foot') {
                    if (this.foottextElement) {
                        this.foottextElement.setValue(item.text);
                    }
                }
            });

            if (positions.length == 0) {
                positions.push(Ext.create('Tualo.DataSets.model.View_editor_blg_pos_' + tabellenzusatz, {}));
            }

            this.positionsList.getStore().loadData(positions);
        }
    },


    removeUneccessaryFields: function (list) {
        list.forEach((item) => {
            delete item['bind'];
            // delete item['listeners'];
            if (item.items) {
                item.items = this.removeUneccessaryFields(item.items);
            }
        });
        return list;
    },
    hideSaveButton: function () {
        try {
            let toolbar_items = this.getView().up().up().down('toolbar').items;
            toolbar_items.each((item) => {
                if (
                    (item.glyph == 'save') ||
                    (item.glyph == 'history')
                ) {
                    item.setHidden(true);
                }
            });
        } catch (e) { }
    },
    initializeReport: async function () {
        // this.hideSaveButton();

        if (this.getViewModel().get('initializeReport') === true) return;
        this.getViewModel().set('initializeReport', true);
        console.log('initializeReport', this.getViewModel().get('record').get('tabellenzusatz'));
        let config = await fetch('./reportconfig/' + this.getViewModel().get('record').get('tabellenzusatz')).then((response) => { return response.json() });
        if (config.success) {
            this.getViewModel().set('config', config);

            if (Ext.isEmpty(Ext.ClassManager.getByAlias('widget.dslist_view_editor_blg_pos_' + this.getViewModel().get('record').get('tabellenzusatz')))) {
                Ext.toast('Die Beleg-Liste ist nicht konfiguriert', 2000);
                console.info('Die Beleg-Liste ist nicht konfiguriert. Bitte den Datenstamm view_editor_blg_pos_' + this.getViewModel().get('record').get('tabellenzusatz') + ' anpassen.');
                return;
            }
            if (Ext.isEmpty(Ext.ClassManager.getByAlias('widget.dslist_view_editor_blg_hdr_' + this.getViewModel().get('record').get('tabellenzusatz')))) {
                Ext.toast('Der Belegkopf ist nicht konfiguriert', 2000);
                console.info('Der Belegkopf ist nicht konfiguriert. Bitte den Datenstamm view_editor_blg_hdr_' + this.getViewModel().get('record').get('tabellenzusatz') + ' anpassen.');
                return;
            }



            let hdr = Ext.create({
                scrollable: 'y',
                xtype: 'panel',
                defaults: {
                    labelWidth: 150,
                },
                items: this.removeUneccessaryFields(config.header),
                // bodyPadding: 10
            });

            this.getView().getComponent('header').getComponent('reportheader').removeAll();
            this.getView().getComponent('header').getComponent('reportheader').add(
                hdr
            );


            this.getView().getComponent('reportlist').add(
                this.positionsList = Ext.create({
                    title: null,
                    border: true,
                    xtype: 'dslist_view_editor_blg_pos_' + this.getViewModel().get('record').get('tabellenzusatz'),
                    plugins: {
                        gridfilters: true,
                        cellediting: {
                            clicksToEdit: 1,
                            listeners: {
                                edit: function (editor, fld) {
                                    this.grid.checkAutoNewRow(fld.rowIdx);
                                    this.grid.fireEvent('edited', fld.record, fld);
                                    return true;
                                }
                            }
                        }
                    },
                    store: {
                        type: 'json',
                        getHeader: this.getReportHeader.bind(this),
                        model: 'Tualo.DataSets.model.View_editor_blg_pos_' + this.getViewModel().get('record').get('tabellenzusatz'),
                    },
                    // bodyPadding: 10
                })
            );

            if (Ext.isEmpty(config.headtext)) {
                this.getView().getComponent('reportheader').setHidden(true);
            } else {
                this.getView().getComponent('reportheader').setHidden(false);
                let cpm = Ext.create(config.headtext);
                this.headtextElement = cpm;
                this.getView().getComponent('reportheader').add(cpm);
            }
            if (Ext.isEmpty(config.foottext)) {
                this.getView().getComponent('reportfooter').setHidden(true);
            } else {
                this.getView().getComponent('reportfooter').setHidden(false);
                let cpm = Ext.create(config.foottext);
                this.foottextElement = cpm;
                this.getView().getComponent('reportfooter').add(cpm);
            }
        }
        this.reportData(this.getViewModel().get('record').get('tabellenzusatz'), this.getViewModel().get('record').get('id'));

    },

    reject: function () {
        let me = this;
        Ext.Msg.show({
            title: 'Stornieren?',
            message: 'Möchten Sie diesen Beleg wirklich stornieren?',
            buttons: Ext.Msg.YESNOCANCEL,
            icon: Ext.Msg.QUESTION,
            fn: async function (btn) {
                if (btn === 'yes') {
                    let report = await fetch(
                        './rejectreport/' + me.getViewModel().get('record').get('tabellenzusatz') + '/' + me.getViewModel().get('record').get('id') + '',
                        {
                            method: 'GET'
                        }
                    ).then((response) => { return response.json() });
                    if (report.success) {
                        me.getViewModel().get('record').set('id', report.data.id);
                        me.reportData(me.getViewModel().get('record').get('tabellenzusatz'), me.getViewModel().get('record').get('id'));
                    }
                } else if (btn === 'no') {
                    console.log('No pressed');
                } else {
                    console.log('Cancel pressed');
                }
            }
        });


    },
    pay: function () {
        Ext.getApplication().redirectTo('payreport/' + this.getViewModel().get('record').get('tabellenzusatz') + '/' + this.getViewModel().get('record').get('id'));
    }
    */
});