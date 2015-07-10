Polymer({

  ready: function(){

    this.syncObjectList = [];

    console.log("fetching")

    chrome.storage.local.get("syncEntries", function(data){

      console.log(data);

      if(data.syncEntries){

        this.syncObjectList = data.syncEntries;

      }

      else{

        this.syncObjectList = [];

      }

    }.bind(this));

    this.addEventListener("nosynclocation", function(){

      this.$["location-toast"].show();

    });

  },

  observe: {

    "selected.syncLocationID": "update",

    "selected.depth": "update",

    "selected.rootID": "update",

    "syncObjectList.length": "update"

  },

  update: function(){

    console.log("update")

    this.job("store wait", function(){

      chrome.storage.local.set({"syncEntries": this.syncObjectList});

    }, 500);

  },

  refObjectChanged: function(){

    this.$.options.createSyncObject(this.refObject);

  },

  addSyncEntry: function(){

    this.$.picker.open();

  }

})