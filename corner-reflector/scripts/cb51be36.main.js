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
        raphael: '../components/raphael/raphael-min',
        bootstrap: 'vendor/bootstrap'
    },

    map: {
        
    }
});
 
require(['app']);