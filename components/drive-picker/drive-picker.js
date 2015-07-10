Polymer({

  open: function(){

    this.entries = [];

    this.path = [{name: "root", id: "root"}];

    this.updateEntries();

    this.super();

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

  updateEntries: function(){

    this.getToken(function(token){

      console.log(this);

      var auth = {"Authorization": "Bearer " + token};

      var params = {

        "q": "'" + this.path[0].id + "' in parents and (mimeType = 'application/vnd.google-apps.folder' or not mimeType contains 'google-apps')  and trashed = false"

      };

      this.$["list-entries"].headers = auth;

      this.$["list-entries"].params = params;

      this.$["list-entries"].go();

    }.bind(this));

  },

  updateEntriesResponse: function(e){

    var response = JSON.parse(e.detail.xhr.response);

    for(var i = 0; i != response.items.length; i++){

      var isFolder = response.items[i].mimeType == "application/vnd.google-apps.folder";

      this.entries.push({

        name: response.items[i].title,

        id: response.items[i].id,

        isFolder: isFolder

      });

    }

    this.entries.sort(this.alphaSort);

    this.entries.sort(this.folderSort);

  },

  alphaSort: function(a, b){

    if(a.name.toLowerCase() < b.name.toLowerCase()){

      return -1;

    }

    else if(a.name.toLowerCase() > b.name.toLowerCase()){

      return 1;

    }

    else{

      return 0;

    }

  },

  folderSort: function(a, b){

    var i;

    i = (a.isFolder) ? -1 :  1;

    return i;

  },

  forwardPath: function(e){

    for(var i = 0; i != this.entries.length; i++){

      if(this.entries[i].id == e.target.parentNode.id){

        this.job("", function(){

          var entry = this.entries[i];

          this.path.unshift({

            name: entry.name,

            id: entry.id,

            isFolder: entry.isFolder

          });

          this.entries = [];

          this.updateEntries();

        }, 125);

        break;

      }

    }

  },

  backPath: function(){

    this.path.splice(0, 1);

    this.entries = [];

    this.updateEntries();

  },

  select: function(){

    this.job("close delay", function(){

      this.selected = {

        name: this.path[0].name,

        id: this.path[0].id,

        isFolder: this.path[0].isFolder

      };

    }, 500);

    this.close();

  },

  close: function(){

    this.super();

  }

})