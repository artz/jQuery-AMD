/*
    jQuery AMD
    A plugin that adds the AMD (Asynchronous Module Definition) to jQuery.
*/
!function($, window, undefined) {

    // Make JSLint happier.
    "use strict";

    function is( str, type ) {
        return typeof str === type;
    }

    function isString( test ) {
        return is( test, "string" );
    }

    function isFunction( test ) {
        return is( test, "function" );
    }

/*
    Boot.define
    Define a module, based on the Asynchronous Module Definition (AMD)
    http://wiki.commonjs.org/wiki/Modules/AsynchronousDefinition
*/
    var $Observer = $({}),
        modules = {},
        moduleDefinitions = {},
        definedModules = [],
        amdOptions = {
            basePath: "",
            filename: function(str){ return str.toLowerCase(); },
            suffix: ".min.js"
        };

    $.define = function( moduleName, moduleDependencies, moduleDefinition ) {

        if ( ! isString( moduleName ) ) {
            moduleDefinition = moduleDependencies;
            moduleDependencies = moduleName;
            moduleName = undefined;
        }

        if ( ! $.isArray( moduleDependencies ) ) {
            moduleDefinition = moduleDependencies;
            moduleDependencies = undefined;
        }

        // Load in any dependencies, and pass them into the use callback.
        if ( moduleDependencies ) {
            // Remember that this guy has a dependency, and which one it is.
            moduleDefinition.d = moduleDependencies;
        }

        if ( moduleName ) {
            moduleDefinitions[ moduleName ] = moduleDefinition;
        } else {
            definedModules.push( moduleDefinition );
        }
    };

    // We conform to the AMD spec.
    // https://github.com/amdjs/amdjs-api/wiki/AMD
    $.define.amd = {};
    if ( ! window.define ) {
        window.define = $.define;
    }

    function resolve( customOptions, module ) {

        var options = $.extend( {}, amdOptions, customOptions || {} ),
            basePath = options.basePath,
            filename = options.filename( module ),
            suffix = options.suffix;

        // If the module name ends with .js
        if ( /\.js$/.test( module ) ) {
            // Use the module as the filename instead.
            filename = module;
            suffix = "";
            // If the module name starts with "http://" or "https://"
            if ( /^http[s]*:\/\//.test( module ) ) {
                // Remove the basePath
                basePath = "";
            }
        }

        return basePath + filename + suffix;
    }

    // Resolves a module based on a string.
    function getLibrary( moduleName ) {

        var obj = window;

        $.each( moduleName.split("."), function( i, name ) {
            if ( typeof obj[ name ] === "object" ) {
                obj = obj[ name ];
            }
            // Consider breaking each here.
        });

        return obj;
    }

    // Global default require options.
    // To Do: Provide way to update.
    $.require = function( customOptions, moduleNames, callback ) {

        if ( $.isArray( customOptions ) || isString( customOptions ) ) {
            callback = moduleNames;
            moduleNames = customOptions;
            customOptions = {};
        }

        moduleNames = isString( moduleNames ) ? [ moduleNames ] : moduleNames;

        var options = $.extend( {}, amdOptions, customOptions ),
            callbackArgs = [],
            moduleCount = 0;

        function moduleReady( i, moduleName, module ) {

            if ( module ) {
                modules[ moduleName ] = module;
            }

            callbackArgs[i] = modules[ moduleName ];

            // All dependencies loaded, fire callback.
            if ( ++moduleCount === moduleNames.length ) {
                if ( $.isFunction( callback ) ) {
                    callback.apply( $, callbackArgs );
                }
            }

            // Tell the others.
            if ( module ) {
                $Observer.trigger( moduleName );
            }
        }

        $.each( moduleNames, function( i, moduleName ) {

            function defineModule() {

                var module,
                    moduleDependencies,
                    moduleDefinition = moduleDefinitions[ moduleName ] || definedModules.shift();

                if ( moduleDefinition ) {

                    if ( moduleDependencies = moduleDefinition.d ) {

                        $.require( customOptions, moduleDependencies, function(){
                            module = ( isFunction( moduleDefinition ) ? moduleDefinition.apply( $, arguments ) : moduleDefinition ) || $;
                            moduleReady( i, moduleName, module );
                        });

                    } else {

                        module = ( isFunction( moduleDefinition ) ? moduleDefinition.call($, $) : moduleDefinition ) || $;
                        moduleReady( i, moduleName, module );

                    }

                // Otherwise see if we can snag the module by name (old skool).
                } else {
                    moduleReady( i, moduleName, getLibrary( moduleName ) );
                }
            }

            // If this module has already been defined...
            if ( moduleName in modules ) {

                // Check for the object.
                if ( modules[ moduleName ] ){
                    moduleReady( i, moduleName );
                // It's undefined, so wait a little bit.
                } else {
                    $Observer.bind( moduleName, function(){
                        moduleReady( i, moduleName );
                    });
                }

            // Otherwise we'll need to load and define on the fly,
            // all the whilest managing dependencies.
            } else {

                // Temporarily give this guy something so incoming
                // module requests wait until the event is emmitted.
                modules[ moduleName ] = undefined;

                // If the module was defined by some other script
                if ( moduleDefinitions[ moduleName ] ) {
                    defineModule();
                // Otherwise fetch the script based on the module name
                } else {
                    $.ajax({
                        url: resolve( options, moduleName ),
                        dataType: "script",
                        cache: true,
                        complete: defineModule
                    });
                }
            }
        });
    };

    $.require.option = function( customOptions, value ) {

        if ( isString( customOptions ) ) {
            if ( value ) {
                amdOptions[ customOptions ] = value;
            } else {
                return amdOptions[ customOptions ];
            }
        } else {
            $.extend( amdOptions, customOptions );
        }
    };

}(jQuery, this);
