Polymer({

  selectedChanged: function(){

    if(this.selected){

      this.open();

    }

  },

  createSyncObject: function(refObject){

    console.log("create");

    this.selected = {

      name: refObject.name,

      rootID: refObject.id,

      isFolder: refObject.isFolder,

      depth: 3,

      syncLocationID: null,

      path: null

    };

    this.syncObjectList.unshift(this.selected);

    this.open();

  },

  setSyncLocation: function(){

    chrome.fileSystem.chooseEntry({

      type: "openDirectory",

    }, function(entry){

      this.selected.syncLocationID = chrome.fileSystem.retainEntry(entry);

      chrome.fileSystem.getDisplayPath(entry, function(path){

        this.selected.path = path;

      }.bind(this));

    }.bind(this));

  },

  accept: function(){

    this.close();

    this.job("deselect wait", function(){

      this.selected = null;

    }, 250);

  }

});