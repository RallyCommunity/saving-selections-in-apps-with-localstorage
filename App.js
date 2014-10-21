Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    items: [
        {html:'Select a Filter checkbox to filter the grid'},
        {
            xtype: 'container',
            itemId: 'StateFilter'
        },
        {
            xtype: 'container',
            itemId: 'ReleaseFilter'
        }
        ],
    launch: function() {
        document.body.style.cursor='default';
        this._createFilterBox('State');
        this._createFilterBox('Release');
    },
    _createFilterBox: function(property){
        this.down('#'+property+'Filter').add({
            xtype: 'checkbox',
            cls: 'filter',
            boxLabel: 'Filter table by '+property,
            id: property+'Checkbox',
            scope: this,
            handler: this._setStorage
        });
        this.down('#'+property+'Filter').add({
            xtype: 'rallyattributecombobox',
            cls: 'filter',
            id: property+'Combobox',
            model: 'Defect',
            field: property,
            value: localStorage.getItem(property+'Filtervalue'), //setting default value
            listeners: {
                select: this._setStorage,
                ready: this._setStorage,
                scope: this
            }
        });
    },
    
    _setStorage: function() {
        localStorage.setItem('StateFiltervalue',Ext.getCmp('StateCombobox').getValue());
        localStorage.setItem('ReleaseFiltervalue',Ext.getCmp('ReleaseCombobox').getValue());
        this._getFilter();
    },
    
    _getFilter: function() {
        var filter = Ext.create('Rally.data.wsapi.Filter',{property: 'Requirement', operator: '=', value: 'null'});
        filter=this._checkFilterStatus('State',filter);
        filter=this._checkFilterStatus('Release',filter);
            if (this._myGrid === undefined) {
                this._makeGrid(filter);
            }
            else{
                this._myGrid.store.clearFilter(true);
                this._myGrid.store.filter(filter);
               
            }
    },
        
    _checkFilterStatus: function(property,filter){
        if (Ext.getCmp(property+'Checkbox').getValue()) {
            var filterString=Ext.getCmp(property+'Combobox').getValue()+'';
            var filterArr=filterString.split(',');
            var propertyFilter=Ext.create('Rally.data.wsapi.Filter',{property: property, operator: '=', value: filterArr[0]});
            var i=1;
            while (i < filterArr.length){
                propertyFilter=propertyFilter.or({
                    property: property,
                operator: '=',
                value: filterArr[i]
            });
            i++;
        }
        filter=filter.and(propertyFilter);
        }
        return filter;
    },
    _makeGrid:function(filter){
        console.log("making a grid");
       this._myGrid = Ext.create('Rally.ui.grid.Grid', {
            itemId:'defects-grid',
            columnCfgs: [
                'FormattedID',
                'Name',
                'State',
                'Release'
            ],
            context: this.getContext(),
            storeConfig: {
                model: 'defect',
                context: this.context.getDataContext(),
                filters: filter
            }
        });
       this.add(this._myGrid);
    }
   

});

