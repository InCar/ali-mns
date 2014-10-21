module.exports = function (grunt) {

    require("load-grunt-tasks")(grunt);

    grunt.initConfig({
        typescript: {
            index: {
                src: ['ts/*.ts'],
                dest: 'index.js',
                options: {
                    module: 'commonjs',
                    sourceMap: true,
                    basePath: "ts/",
                    comments: true,
                    target: "ES5"
                }
            }
        },

        clean: {
            typescript: ["index.js"]
        }
    });

    grunt.registerTask("build", [
        "clean",
        "typescript"
    ]);

    grunt.registerTask("default", ["build"]);
};