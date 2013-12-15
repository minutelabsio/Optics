define(
    [
        'jquery'
    ],
    function(
        $
    ){

        $(document).on('click', 'a[href^=http]', function(e){
         
            var $this = $(this)
                ,url = $this.attr('href')
                ,newtab = ($this.attr('target') === '_blank' || e.metaKey || e.ctrlKey)
                ;
         
            window._gaq = window._gaq || [];
         
            try {
         
                window._gaq.push(['_trackEvent', 'Outbound Links', e.currentTarget.host, url, 0]);
         
                if (!newtab) {
         
                    e.preventDefault();
                    setTimeout(function(){
                        document.location = url;
                    }, 100);
                }
            } catch (err){}
        });
    }
);