module.exports = function (grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        ngAnnotate: {
            options: {
                singleQuotes: true
            },
            app: {
                files: {
                    'dist/app_scripts.js': ['app/app.js', 'app/cambiarContrasena.ctrl.js',
                        'app/firebase.svc.js', 'app/login.ctrl.js', 'app/nuevaContrasena1.ctrl.js',
                        'app/nuevaContrasena2.ctrl.js', 'app/rsvp.ctrl.js']
                }
            }
        },
        concat: {
            js: {
                src: ['js/custom.js'],
                dest: 'dist/js_scripts.js'
            }
        },
        uglify: {
            app: {
                files: {
                    'dist/app_scripts.min.js': ['dist/app_scripts.js']
                }
            },
            js: {
                files: {
                    'dist/js_scripts.min.js': ['dist/js_scripts.js']
                }
            }
        },
        concat_css: {
            files: {
                files: {
                    'dist/styles.css': ['css/grid.css', 'css/magnific-popup.css',
                        'css/font-awesome.min.css',
                        'css/animate.min.css', 'css/flaticon.css',
                        'css/style.css',
                        'css/colors/default.css',
                        'css/custom.css'
                        ]
                },
            },
        },
        cssmin: {
            target: {
                files: {
                    'dist/styles.min.css': ['dist/styles.css']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-ng-annotate');
    /*appTask runs the ngAnnotate which also concats the files and then we uglify it*/
    grunt.registerTask('appTask', ['ngAnnotate', 'uglify:app']);
    /*jsTask concats and uglifies all the others JS files*/
    grunt.registerTask('jsTask', ['concat:js', 'uglify:js']);
    /*cssMinTask concats and uglifies the CSS files*/
    grunt.registerTask('cssMinTask', ['concat_css', 'cssmin']);
};
