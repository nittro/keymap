module.exports = function (grunt) {

    var files = grunt.file.readJSON('nittro.json').files;

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        uglify: {
            options: {
                mangle: false,
                sourceMap: false
            },
            nittro: {
                files: {
                    'dist/js/nittro-extras-keymap.min.js': files.js
                }
            }
        },

        concat: {
            options: {
                separator: ";\n"
            },
            nittro: {
                files: {
                    'dist/js/nittro-extras-keymap.js': files.js
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.registerTask('default', ['uglify', 'concat']);

};
