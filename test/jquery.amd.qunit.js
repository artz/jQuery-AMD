
test("Environment", function(){
    ok( window.jQuery, 'jQuery is defined.' );
    same( jQuery({}).jquery, "1.6.4", "jQuery 1.6.4 verified." );
    ok( window.jQuery.require, 'jQuery.require is defined.' );
    ok( window.jQuery.define, 'jQuery.define is defined.' );
});

test("Define Module by Object Literal", function(){
    jQuery.define( "my.module1", { success: true } );
    jQuery.require( "my.module1", function( myModule ) {
        ok( myModule, "Module Object was passed." );
        ok( myModule.success, "Correct Module Object was passed." );
    });
});

test("Define Module by Function", function(){
    jQuery.define( "my.module2", function(){ return { success: true } } );
    jQuery.require( "my.module2", function( myModule ) {
        ok( myModule, "Module Object was passed." );
        ok( myModule.success, "Correct Module Object was passed." );
    });
});

asyncTest("Require Relative JavaScript Resource", function(){
    jQuery.require("js/somelib.js", function(){
        ok( window.SomeLib, "Resolve a relative JavaScript resource." );
        start();
    });
});

asyncTest("Require Absolute JavaScript Resource", function(){

    jQuery.require("http://www.artzstudio.com/files/Boot/src/boot.js", function(){
        ok( window.Boot, "Resolve an external JavaScript resource." );
    });

    setTimeout(function(){
        start();
    }, 500);

});

test("Set Options", function(){

    // Change global default for require & define functions.
    jQuery.require.option("basePath", "js/");

    same( jQuery.require.option("basePath"), "js/", "basePath set correctly." );

});

asyncTest("Require Single Defined Module", function(){

    $.require("jquery.alpha", function( jQuery ){
        var $testDiv = $("<div></div>");
        same( arguments.length, 1, "One argument passed.");
        same( jQuery({}).jquery, "1.6.4", "jQuery object passed." );
        same( $testDiv.alpha().html(), "Alpha", "jQuery plugin loaded successfully." );
        start();
    });

});

asyncTest("Require a Previously Defined Module", function(){

    $.require("jquery.alpha", function( jQuery ){
        var $testDiv = $("<div></div>");
        same( arguments.length, 1, "One argument passed.");
        same( jQuery({}).jquery, "1.6.4", "Queued jQuery object passed." );
        same( $testDiv.alpha().html(), "Alpha", "Queued require works." );
        start();
    });

});

asyncTest("Require Multiple Defined Modules", function(){

    $.require(["jquery.gamma", "jquery.delta"], function( jQuery ){
        var $testDiv = $("<div></div>");
        same( arguments.length, 2, "Two arguments passed." );
        same( jQuery({}).jquery, "1.6.4", "jQuery object passed." );
        same( $testDiv.delta().html(), "Delta", "Delta plugin loaded successfully." );
        same( $testDiv.gamma().html(), "Gamma", "Gamma plugin loaded successfully." );
        start();
    });

});

asyncTest("Require Defined Module With Dependency", function(){

    $.require({ basePath: "js/" }, "jquery.beta", function( jQuery ){
        var $testDiv = $("<div></div>");
        same( arguments.length, 1, "One argument passed." );
        same( jQuery({}).jquery, "1.6.4", "jQuery object passed." );
        same( $testDiv.beta().html().toLowerCase(), "Beta <b>Epsilon</b>".toLowerCase(), "Beta plugin loaded successfully." );
        same( $testDiv.epsilon().html(), "Epsilon", "Epsilon plugin dependency loaded successfully." );
        start();
    });

});

asyncTest("Require Multiple Defined Modules With Multiple Dependencies", function(){

    $.require({ basePath: "js/" }, ["jquery.beta", "jquery.zeta"], function( jQuery ){
        var $testDiv = $("<div></div>");
        same( arguments.length, 2, "Two arguments passed." );
        same( jQuery({}).jquery, "1.6.4", "jQuery object passed." );
        same( $testDiv.beta().html().toLowerCase(), "Beta <b>Epsilon</b>".toLowerCase(), "Beta plugin loaded successfully." );
        same( $testDiv.epsilon().html(), "Epsilon", "Epsilon plugin dependency loaded successfully." );
        same( $testDiv.zeta().html().toLowerCase(), "Zeta <b>Theta <i>Lambda</i></b>".toLowerCase(), "Zeta, Theta and Lambda plugins loaded successfully." );
        start();
    });

});

asyncTest("Require Classic jQuery Plugin", function(){

    $.require({ basePath: "js/" }, "jquery.classic", function(){
        var $testDiv = $("<div></div>");
        same( arguments.length, 1, "One argument passed." );
        same( jQuery({}).jquery, "1.6.4", "jQuery object passed." );
        same( $testDiv.classic().html(), "Classic", "Classic plugin loaded successfully." );
        start();
    });

});

asyncTest("Require Single AMD Library", function(){

    $.require("yourlib/bar", function( yourLibBar ) {
        same( yourLibBar.bar && yourLibBar.bar(), true, "Module passed successfully." );
        start();
    });

});

asyncTest("Require Single AMD Library With Multiple Dependencies", function(){

    $.require(["yourlib/foo"], function( yourLibFoo ) {
        same( yourLibFoo.foo, true, "Foo module loaded." );
        same( yourLibFoo.bar && yourLibFoo.bar(), true, "Bar module dependency loaded." );
        same( yourLibFoo.baz, true, "Baz module dependency loaded." );
        start();
    });

});

asyncTest("Require Multiple Pre-defined AMD Libraries", function(){

    $.require(["yourlib/foo", "mylib/foo"], function( yourLibFoo, myLibFoo ) {
        same( myLibFoo.foo, true, "MyLib Foo module passed.");
        same( yourLibFoo.foo, true, "YourLib Foo module passed.");
        same( yourLibFoo.bar(), true, "YourLib Bar module passed.");
        same( yourLibFoo.baz, true, "YourLib Baz module passed.");
        start();
    });

});

asyncTest("Require Nothing", function(){

    var timeout = setTimeout(function() {
        ok( null, 'Callback never fired up.' );
        start();
    }, 1000);

    $.require([], function( ) {
        same( arguments.length, 0, "No arguments passed." );
        clearTimeout(timeout);
        start();
    });

});

asyncTest("Customized Filename", function(){

    $.require({ basePath: "js/", filename: function(name){ return name.replace("/", "."); }, suffix: ".js" }, "custom/name", function( custom ){
        same( custom.custom, true, "Customized filename works!");
        start();
    });

});
