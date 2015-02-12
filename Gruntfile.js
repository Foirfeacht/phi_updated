module.exports = function(grunt) {
  //Project configuration.
  grunt.initConfig({
    compress: {
      main: {
        options: {
          archive: 'dist/custom_module.zip'
        },
        expand: true,
        cwd: 'dist/',
        src: ['**'],
        dest: 'custom_module/'
      }
    }
  });
  
  // Load the tasks
  grunt.loadTasks('grunt');
  
  // Zip
  grunt.loadNpmTasks('grunt-contrib-compress');
}