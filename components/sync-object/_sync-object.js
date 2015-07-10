Polymer({

  ready: function(){

    console.log(this.data);

    this.getRoot();

  },

  observe: {

    "data.syncLocationID": "getRoot"

  },

  getRoot: function(){

    if(this.data.syncLocationID){

      chrome.fileSystem.restoreEntry(this.data.syncLocationID, function(entry){

        this.root = entry;

      }.bind(this));

    }

  },

  syncDown: function(){

    if(this.data.isFolder){

      this.tree = {

        name: this.data.name,

        id: this.data.rootID,

        content: [],

        populated: false

      };

      this.scanPath = [];

      this.scanTree(this.tree);

    }

    else{

      this.getFileInfo(this.data.rootID);

    }

  },

  scanTree: function(dir){

    this.scanPath.push(dir.name);

    if(dir.populated){

      var i;

      for(i = 0; i != dir.content.length; i++){

        if(dir.content[i].content){

          this.scanTree(dir.content[i]);

        }

        else if(!dir.content[i].downloaded && dir.content[i].downloadURL){

          this.activePath = this.scanPath.join('/') + "/" + dir.content[i].name;

          this.stopScan = true;

          this.activeFile = dir.content[i];

          this.downloadFile();

          this.scanPath.push("");

        }

        if(this.stopScan){

          break;

        }

      }

      this.scanPath.pop();

    }

    else{

      this.activePath = this.scanPath.join('/');

      this.activeDirectory = dir;

      this.stopScan = true;

      this.populateDirectory();

    }

    if(this.scanPath.length === 0){

      console.log("finished");

    }

  },

  downloadFile: function(){

    this.job("request wait", function(){

      this.getToken(function(token){

        var updater = this.$['download-file'];

        updater.headers = {"Authorization": "Bearer " + token};

        updater.go();

      }.bind(this));

    }, 100);

  },

  downloadFileResponse: function(e){

    console.log(this.activePath);

    this.root.getFile(this.activePath, {create: true}, function(entry){

      entry.createWriter(function(writer){

        writer.onwriteend = function(e){

          console.log("done writing");

          this.activeFile.downloaded = true;

          this.scanPath = [];

          this.stopScan = false;

          this.scanTree(this.tree);

        }.bind(this);

        writer.onerror = function(){

          console.log("write error");

        };

        writer.write(e.detail.xhr.response);

      }.bind(this));

    }.bind(this), function(e){

      console.log("open file error");

    });

  },

  populateDirectory: function(){

    this.job("request wait", function(){

      this.getToken(function(token){

        var updater = this.$['populate-directory'];

        updater.headers = {"Authorization": "Bearer " + token};

        updater.params = {

          "q": "'" + this.activeDirectory.id + "' in parents and (mimeType = 'application/vnd.google-apps.folder' or not mimeType contains 'google-apps')  and trashed = false"

        };

        updater.go();

      }.bind(this));

    }, 100);

  },

  populateDirectoryResponse: function(e){

    console.log("loading directory '" + this.activeDirectory.name + "' content");

    var items = JSON.parse(e.detail.xhr.response).items;

    for(var i = 0; i != items.length; i++){

      if(items[i].downloadUrl){

        console.log(items[i]);

        this.activeDirectory.content.push({

          name: items[i].title.replace(/\//g, "-"),

          mimeType: items[i].mimeType,

          downloadURL: items[i].downloadUrl,

          downloaded: false

        });

      }

      else{

        // console.log("  -found folder '" + items[i].title + "' in directory.")

        this.activeDirectory.content.push({

          name: items[i].title.replace(/\//g, "-"),

          id: items[i].id,

          content: [],

          populated: false

        });

      }

    }

    this.createDirectory(this.root, this.activePath.split("/"), function(){

      console.log("im back");

      this.activeDirectory.populated = true;

      this.scanPath = [];

      this.stopScan = false;

      this.scanTree(this.tree);

    }.bind(this));

  },

  createDirectory: function(root, path, callback){

    root.getDirectory(path[0], {create: true}, function(entry){

      path.splice(0, 1);

      if(path.length){

        this.createDirectory(entry, path, callback).bind(this);

      }

      else{

        callback();

      }

    }.bind(this));

  },

  getToken: function(callback){

    chrome.identity.getAuthToken({ 'interactive': false }, function(token) {

      this.token = token;

      if(this.token){

        callback(token);

      }

      else{

        console.error("`authToken` attribute must be filled with a valid OAuth2 key");

      }

    }.bind(this));

  },

  settings: function(e){

    this.selected = this.data;

  },

  remove: function(e){

    for(var i = 0; i != this.syncObjectList.length; i++){

      if(this.syncObjectList[i] == this.data){

        this.syncObjectList.splice(i, 1);

        break;

      }

    }

  },

});


















