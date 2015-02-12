module.exports = function(grunt) {
  
  var usage = 'Usage: "grunt packModule:storeId"';
  
  grunt.registerTask("packModule", "Pack developed custom module in a zip file ready to be exported to Vericle Admin UI", function(storeId){
    if (!storeId){
      grunt.fail.fatal(usage);
    }    
    grunt.file["delete"]("dist");
    grunt.file.mkdir("dist");    
    
    grunt.file.recurse("data_vaultq/store/"+storeId, function (abspath, rootdir, subdir, filename) {
      grunt.file.copy(abspath, "dist/data_vaultq/store/"+storeId+"/"+subdir+"/"+filename);
    });
    
    grunt.file.recurse("data_vault/store/"+storeId, function (abspath, rootdir, subdir, filename) {
      grunt.file.copy(abspath, "dist/data_vault/store/"+storeId+"/"+subdir+"/"+filename);
    });
    
    grunt.task.run("compress");
    
    grunt.log.write("Module Packed");
  });
}