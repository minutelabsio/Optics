require.config({
    shim: {
        'raphael': {
            exports: 'Raphael'
        },
        'bootstrap': {
            deps: ['jquery']
        }
    },

    paths: {
        jquery: 'vendor/jquery.min',
        raphael: 'vendor/raphael-min',
        bootstrap: 'vendor/bootstrap'
    },

    map: {
        
    }
});
 
require(['app-mirror']);