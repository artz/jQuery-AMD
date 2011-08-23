/*
	jQuery AMD
	A plugin that adds the AMD (Asynchronous Module Definition) to jQuery.
*/
!function($, window, undefined){
	
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
	var $observer = $({}),
		modules = {},
		moduleDefinitions = {},
		definedModules = [];
	
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
	}

	// We conform to the AMD spec.
	// https://github.com/amdjs/amdjs-api/wiki/AMD
	$.define.amd = {};

	function resolve( customOptions, module ) {
		var options = $.extend( {}, amdOptions, customOptions || {} );
		return options.basePath + options.filename( module ) + options.suffix;
	}

	// Resolves a module based on a string.
	function getLibrary( moduleName ) {
		// i.e. "jQuery.alpha", "MyLib.foo.bar"
		var obj = window;

		$.each( moduleName.split("."), function( i, name ) {
			if ( obj.hasOwnProperty( name ) ) {
				obj = obj[ name ];
			}
		});
	
		return obj;
	}

	// Global default use options.
	// To Do: Provide way to update.
	var useOptions = {};
	$.use = function( customOptions, moduleNames, callback ) {

		if ( $.isArray( customOptions ) || isString( customOptions ) ) {
			callback = moduleNames;
			moduleNames = customOptions;
		}

		moduleNames = isString( moduleNames ) ? [ moduleNames ] : moduleNames;
		
		var options = $.extend( {}, useOptions, customOptions || {} ),
			callbackArgs = [],
			moduleCount = 0;
			
		function moduleReady( i, moduleName, module ) {
			
			if ( module ) {
				modules[ moduleName ] = module;
			}
			
			callbackArgs[i] = modules[ moduleName ];
			
			// All dependencies loaded, fire callback.
			if ( ++moduleCount === moduleNames.length ) {
				callback.apply( $, callbackArgs );
			}
			
			// Tell the others.
			if ( module ) {
				$observer.trigger( moduleName );
			}
		}

		$.each( moduleNames, function( i, moduleName ) {



			// If this module has already been defined...
			if ( moduleName in modules ) {
				
				// Check for the object.
				if ( modules[ moduleName ] ){
					moduleReady( i, moduleName );
				// It's undefined, so wait a little bit.
				} else {
					$observer.bind( moduleName, function(){
						moduleReady( i, moduleName );
					});
				}
				
			// Otherwise we'll need to load and define on the fly,
			// all the whilest managing dependencies.	
			} else {
				
				// Temporarily give this guy something so incoming 
				// module requests wait until the event is emmitted.
				modules[ moduleName ] = undefined;
				
				$.ajax({
					url: resolve( options, moduleName ),
					dataType: "script",
					cache: true,
					complete: function( src ) {
						
						var module,
							moduleDependencies,
							moduleDefinition;
						
						// If a module was defined after our download.
						if ( moduleDefinition = moduleDefinitions[ moduleName ] || definedModules.shift() ) {
							
							if ( moduleDependencies = moduleDefinition.d ) {
	
								$.use( moduleDependencies, function(){
									module = ( isFunction( moduleDefinition ) ? moduleDefinition.apply( $, arguments ) : moduleDefinition ) || $;
									moduleReady( i, moduleName, module );
								});
	
							} else {
								
								module = ( isFunction( moduleDefinition ) ? moduleDefinition($) : moduleDefinition ) || $;
								moduleReady( i, moduleName, module );
	
							}
	
						// Otherwise see if we can snag the module by name (old skool).	
						} else {
							moduleReady( i, moduleName, getLibrary( moduleName ) );
						}
					}
				});
			}
		});
	};
	
	var amdOptions = {	
			basePath: "",
			filename: function(str){ return str.toLowerCase(); },
			suffix: ".min.js"
		};
	
	function option( customOptions, value ) {
		if ( isString( customOptions ) ) {
			amdOptions[ customOptions ] = value;
		} else {
			$.extend( amdOptions, customOptions );
		}
	}
	
	$.use.option = option;
	
}(jQuery, this);