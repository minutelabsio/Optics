define(
    [
        'jquery'
    ],
    function(
        $
    ){

        var defaults = {

            preventDefault: true,
            duration: 1000
        };

        function linkScroller(el, cfg){

            var options = $.extend({}, defaults, cfg)
                ,scroller = $('html, body')
                ;

            scroller = scroller.filter(function(){

                var $this = $(this)
                    ,top = $this.scrollTop()
                    ,test
                    ;

                $this.scrollTop(top+1);
                test = $this.scrollTop() === (top + 1);
                $this.scrollTop(top);
                return test;
            });

            function handler(e){

                var to = $($(this).attr('href'))
                    ,pos = to.offset().top
                    ,last
                    ;

                if (options.preventDefault) e.preventDefault();

                if (!to.length) return;

                scroller.animate({
                    scrollTop: pos
                },{
                    duration: options.duration,
                    step: function(now){

                        if (last && last !== scroller.scrollTop()){
                            $(this).stop();
                        }

                        last = ~~now;
                    }
                });
            }

            if (typeof el === 'string'){

                $(document).on('click', el, handler);
            } else {

                $(el).on('click', handler);
            }
        }

        return function(el, cfg){

            linkScroller(el, cfg)
        };
    }
);