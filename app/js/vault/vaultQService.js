app.factory('vaultQ', [ '$http', '$q', '$resource', function($http, $q, $resource) {
  return {
    
    getLatest : function(path) {
      var that = this;

      function processResults(record) {
        if (record && record.obj) {
          record.obj = angular.fromJson(record.obj);
        }
        return record;
      }
      return that.getLatestRaw(path).then(processResults);
    },

    getLatestBatch : function(paths) {
      var that = this;

      function processResults(records) {
        if (records) {
          for (var i = 0; i < records.length; i++) {
            var record = records[i];
            if (record && record.obj) {
              record.obj = angular.fromJson(record.obj.replace('"', '\"'));
            }
          }
        }
        return records;
      }
      return that.getLatestRawBatch(paths).then(processResults);
    },

    getLatestRaw : function(path) {
      function processResults(httpResponse) {
        var record = angular.fromJson(httpResponse.data);
        return record;
      }      
      return $http.get('/data_vaultq' + path, {transformResponse : []}).then(processResults);
    },

    getLatestRawBatch : function(paths) {
      var that = this;

      var promices = [];
      for (var i = 0; i < paths.length; i++) {
        var path = paths[i];
        var promise = $http.get('/data_vaultq' + path, {
          transformResponse : []
        });
        promices.push(promise);
      }

      function processResults(httpResponses) {
        var batchPortionResults = [];
        for (var j = 0; j < httpResponses.length; j++) {         
          
          var responce = angular.fromJson(httpResponses[j].data);
          var path = paths[j]

          var batchPortionResult = {
            path : path,
            obj : responce.obj,
            cnt : responce.cnt,
          }
          batchPortionResults.push(batchPortionResult);
        }
        return batchPortionResults;
      }      
      return $q.all(promices).then(processResults);
    },

    put : function(path, obj, currentCnt) {
      var that = this;
      var stringifiedObj = angular.toJson(obj, true);
      return that.putRaw(path, stringifiedObj, currentCnt);
    },

    putRaw : function(path, stringifiedObj) {
      var that = this;

      return $http.post('/data_vaultq' + path, stringifiedObj, {
        transformRequest : [],
        headers : {
          'Content-Type' : 'application/octet-stream'
        }
      });
    },
    
    putBatch : function(pathsAndObjects) {
      var that = this;

      for (var i = 0; i < pathsAndObjects.length; i++) {
        var pathAndObject = pathsAndObjects[i];
        pathAndObject.obj = angular.toJson(pathAndObject.obj);
      }
      return that.putRawBatch(pathsAndObjects);
    },
    
    putRawBatch : function(pathsAndRawObjects) {
      var that = this;

      var promices = [];
      for (var i = 0; i < pathsAndRawObjects.length; i++) {
        var path = pathsAndRawObjects[i].path;
        var obj =  pathsAndRawObjects[i].obj;
        var promise = $http.post('/data_vaultq' + path, obj, {
          transformRequest : [],
          headers : {
            'Content-Type' : 'application/octet-stream'
          }
        });
        promices.push(promise);
      }
      return $q.all(promices);
    },
    
    getUpdatesBatch : function(pathsAndCounters) {
      function processResults(updateResponses) {
        for (var i = 0; i < updateResponses.length; i++) {
          var updateResponse = updateResponses[i];
          if (updateResponse && updateResponse.updates) {
            for (var j = 0; j < updateResponse.updates.length; j++) {
              var update = updateResponse.updates[j];
              update.obj = angular.fromJson(update.obj.replace('"', '\"'));
            }
          }
        }
        return updateResponses;
      }
      return this.getUpdatesRawBatch(pathsAndCounters).then(processResults);
    },
    
    getUpdatesRawBatch : function(pathsAndCounters) {
      var promices = [];
      for (var i = 0; i < pathsAndCounters.length; i++) {
        var path = pathsAndCounters[i].path;
        var cnt = pathsAndCounters[i].cnt;
        
        var fullHttpPath = '/data_vaultq' + path;
        if (cnt){
          fullHttpPath += '?cnt='+cnt;
        } else {
          fullHttpPath += '?cnt=-1';
        }        
        var promise = $http.get(fullHttpPath, {
          transformResponse : []
        });
        promices.push(promise);
      }
      
      function processResults(httpResponses) {
        // [{path:String, updates:[{obj:String, cnt:String}]}]
        var updateResponses = [];
        for (var i = 0; i < httpResponses.length; i++) {
          var httpResponse = httpResponses[i];
          updateResponses.push(angular.fromJson(httpResponse.data));          
        }
        return updateResponses;
      }      
      return $q.all(promices).then(processResults);
    },
    
    putAndGetUpdatesBatch : function(pathsAndObjectsForPut, pathsAndCountersForGet) {
      var that = this;

      if (pathsAndObjectsForPut) {
        for (var i = 0; i < pathsAndObjectsForPut.length; i++) {
          var pathAndObject = pathsAndObjectsForPut[i];
          pathAndObject.obj = angular.toJson(pathAndObject.obj);
        }
      }

      function processResults(result) {
        var updateResponses = result.updateResponses;

        if (updateResponses) {
          for (var i = 0; i < updateResponses.length; i++) {
            var updateResponse = updateResponses[i];
            if (updateResponse && updateResponse.updates) {
              for (var j = 0; j < updateResponse.updates.length; j++) {
                var update = updateResponse.updates[j];
                update.obj = angular.fromJson(update.obj);
              }
            }
          }
        }

        return result;
      }
      return that.putAndGetUpdatesRawBatch(pathsAndObjectsForPut, pathsAndCountersForGet).then(processResults);
    },
    
    putAndGetUpdatesRawBatch : function(pathsAndRawObjectsForPut, pathsAndCountersForGet) {
      var that = this;
      
      return that.putRawBatch(pathsAndRawObjectsForPut).then(function(){
        return that.getUpdatesRawBatch(pathsAndCountersForGet);
      }).then(function processResults(httpResults) {
        var updateResponses = httpResults//res.data.updateResponses;
        return {
          updateResponses : updateResponses
        };
      })
    }    
  }
} ]);