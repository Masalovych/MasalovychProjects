# Table Widget

## Usage

### Creation

To create the widget use this command:


            tableView = new TableView({
                name: 'transferTable',
                id: 'id',
                columns: {
                    'Employee': 'firstName',
                    'Order Type': 'orderType',
                    'Sub Type': 'orderSubType',
                    'Batch Number': 'masterBatchId',
                    'Est End': 'operationEndHour'
                },
                radio: true,
                sort: true,
                callback: _.bind(this.userSelected, this),
                multipleSelect: true,

                collection: collection
            });


### Options

#### name
Class Name

* ```name``` (String) - class name of table wrapper

#### id
Table row ID:

* ```id``` (String) - model attribute to identify table row   
 
#### columns
This is object which describe table columns. {"column_name": "field_name_from_model"}

* ```columns``` (Object) - example 
    
                columns: {
                    'Employee': 'firstName',
                    'Order Type': 'orderType',
                    'Sub Type': 'orderSubType',
                    'Batch Number': 'masterBatchId',
                    'Est End': 'operationEndHour'
                },
                
#### radio
If necessary radio button before each table row set ```radio: true```
  
  * ```radio``` (boolean) 
  
#### sort
If necessary sorting functionality set ```sort: true```. Than you will be able to sort table just making click to table head.
  
  * ```sort``` (boolean) 
  
#### callback
If table is sortable, than if user click to some row this callback will run, and get current model is parameter.
  
  * ```callback``` (underscore method 'bind') - example  ```callback: _.bind(this.userSelected, this)```

#### collection
Backbone.Collection instance with items for table.
  
  * ```collection``` (Backbone.Collection) - example  ```callback: _.bind(this.userSelected, this)```


  
  



