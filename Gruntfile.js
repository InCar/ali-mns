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
                    rootDir: "ts/",
                    comments: true,
                    target: "ES5"
                }
            }
        },

        clean: {
            typescript: ["index.js", "index.js.map"]
        }
    });

    grunt.registerTask("build", [
        "newer:typescript"
    ]);

    grunt.registerTask("rebuild", [
        "clean",
        "build"
    ]);

    grunt.registerTask("default", ["build"]);
};