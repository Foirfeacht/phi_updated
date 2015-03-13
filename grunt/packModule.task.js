module.exports = function(grunt) {
  
  var usage = 'Usage: "grunt packModule:seedStoreId:finalStoreId"';
  
  grunt.registerTask("packModule", "Pack developed custom module in a zip file ready to be exported to Vericle Admin UI", function(seedStoreId, finalStoreId){
    if (!seedStoreId){
      grunt.fail.fatal(usage);
    }    
    grunt.file["delete"]("dist");
    grunt.file.mkdir("dist");    
    
    grunt.file.recurse("data_vaultq/store/"+seedStoreId, function (abspath, rootdir, subdir, filename) {
      var rawContent = grunt.file.read(abspath);
      var modifiedContent = rawContent.replace(new RegExp(seedStoreId, 'g'), finalStoreId);
      
      grunt.file.write("dist/data_vaultq/store/"+finalStoreId+"/"+subdir+"/"+filename, modifiedContent);
    });
    
    grunt.file.recurse("data_vault/store/"+seedStoreId, function (abspath, rootdir, subdir, filename) {
      var rawContent = grunt.file.read(abspath);
      var modifiedContent = rawContent.replace(new RegExp(seedStoreId, 'g'), finalStoreId);
      
      grunt.file.write("dist/data_vault/store/"+finalStoreId+"/"+subdir+"/"+filename, modifiedContent);
    });
    
    grunt.task.run("compress");
    
    grunt.log.write("Module Packed");
  });
}