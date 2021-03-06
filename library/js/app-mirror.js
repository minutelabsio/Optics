define(
[
    'jquery',
    'raphael',
    'modules/link-scroller'
], 
function(
    $,
    Raphael,
    linkScroller
){

    linkScroller('.scrolling-link');

    if (!Modernizr.svg) return;

    function getAngle(x1, y1, x2, y2, x3, y3){

        if (x3 === undefined) {
            
            var x = x2 - x1
                ,y = y2 - y1
                ;

            if (!x && !y) {
                return 0;
            }

            return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;

        } else {
            
            return (getAngle(x1, y1, x2, y2) - getAngle(x2, y2, x3, y3) + 180 + 360) % 360;
        }
    }
    
    $(function(){

        var paper = Raphael('svg-wrap')
            ,rayTrackSize = 999
            ,vertex = [20, 20]
            ,mirrorPath = 'M20,300L'+vertex.join(',')+'L300,20'
            ,mirror = paper.path(mirrorPath).attr({
                'stroke': '#333',
                'stroke-width': 5,
                'stroke-linecap': 'round',
                'stroke-linejoin': 'round'
            })
            ,mirrorWidth = 10
            ,mirrorDashes = ''
            ;


        function isClose(p1, p2){

            var y = Math.abs(p2.y - p1.y)
                ,x = Math.abs(p2.x - p1.x)
                ,epsilon = 0.000001
                ;

            return y < epsilon && x < epsilon;
        }

        function getReflectionPoints(x, y, ang, _refs){

            var incedent = Raphael.transformPath('M'+[x,y].join(',')+'L'+[x,y-rayTrackSize].join(','), 'r' + ang + ',' + [x,y].join(','))
                ,it = Raphael.pathIntersection(incedent, mirrorPath)
                ,alpha
                ,beta
                ;

            _refs = _refs || {
                points: [],
                strs: []
            };

            if (it.length === 0) return _refs;

            // check for duplicate reflections
            if (_refs.points.length){
                
                for ( var i = 0, l = it.length; i < l; ++i ){

                    if ( !isClose(it[i], _refs.points[_refs.points.length-1]) ){
                        it = it[i];
                        break;
                    }                    
                }

                if (it.length) return _refs;

            } else {

                it = it[0];
            }

            // handle case that it exactly hits corner
            if ( isClose({ x: vertex[0], y: vertex[1] }, it) ){

                _refs.points.push({
                    x: it.x,
                    y: it.y,
                    ang: 180 + ang
                });

                _refs.strs.push(it.x + ',' + it.y);

                return _refs;
            }
            
            alpha = 180 - getAngle(x, y, it.x, it.y, vertex[0], vertex[1]);
            beta = 90 - getAngle(it.x, -it.y, vertex[0], -vertex[1]);
            alpha += beta;

            _refs.points.push({
                x: it.x,
                y: it.y,
                ang: alpha
            });

            _refs.strs.push(it.x + ',' + it.y);

            // get subsequent reflections
            return getReflectionPoints(it.x, it.y, alpha, _refs);

        }

        for (var i = 300; i > 10; i -= 10) {
            mirrorDashes += 'M20,' + i + 'L10,' + (i - 10);
            mirrorDashes += 'M' + i + ',20L' + (i - 10) + ',10';
        }

        paper.path(mirrorDashes).attr({
            'stroke': '#888',
            'stroke-width': 2,
            'stroke-linecap': 'round',
        }).toBack();

        var laser
            ,newPath
            ,rot = -57
            ,originPos = { x: 380, y: 350 }
            ,offset = $('#svg-wrap').offset()
            ,instBBox = $('#instructions')
            ,rotateCtrl
            ,moveCtrl
            ,actionCircle
            ,statsBox = paper.text(originPos.x-70, originPos.y+40, stats())
            ,laserBox = paper.set().push(
                actionCircle = paper.circle(originPos.x, originPos.y, 120).attr({
                    'stroke': '#bbb',
                    'stroke-dasharray': '--',
                    fill: '#883',
                    'fill-opacity': 0
                }),
                moveCtrl = paper.rect(originPos.x - 15, originPos.y, 30, 80, 2).attr({
                    stroke: '#3aa',
                    fill: '#3aa',
                    'fill-opacity': 0.5,
                    'cursor': 'move'
                }),
                rotateCtrl = paper.ellipse(originPos.x, originPos.y + 120, 20, 8).attr({
                    fill: '#883',
                    'stroke': '#883',
                    'fill-opacity': 0.5,
                    'stroke-width': 2,
                    cursor: 'url(library/images/cursor-rotate.png) 8 8'
                })
            )
            ,laserAtt = {
                'stroke': '#c00',
                'stroke-width': 3,
                'stroke-linejoin': 'bevel'
            }
            ;
        
        // get some measurements
        offset.width = $('#svg-wrap').innerWidth();
        offset.height = $('#svg-wrap').innerHeight();

        if (instBBox.length){
            instBBox = {
                x: instBBox.offset().left - offset.left,
                y: instBBox.offset().top - offset.top,
                width: instBBox.outerWidth(),
                height: instBBox.outerHeight()
            };

            instBBox.x2 = instBBox.x + instBBox.width;
            instBBox.y2 = instBBox.y + instBBox.height;

        } else {

            instBBox = false;
        }

        function stats(){

            return '';//originPos.x.toFixed(0) + ', ' + originPos.y.toFixed(0) + ' @ ' + rot.toFixed(1) +'°';
        }

        function drawReflections(){

            var intr = getReflectionPoints(originPos.x, originPos.y, rot);
            
            laser && laser.remove();

            if (intr.points.length){
                
                var len = intr.points.length
                    ,lastPt = intr.points[len-1]
                    ,lastX = rayTrackSize * Math.sin(Raphael.rad(lastPt.ang)) + lastPt.x
                    ,lastY = -rayTrackSize * Math.cos(Raphael.rad(lastPt.ang)) + lastPt.y
                    ;

                laser = paper.path('M'+originPos.x + ',' + originPos.y + 
                    'L'+ intr.strs.join('L') + 
                    'L' + [lastX,lastY].join(',')
                ).attr(laserAtt);
                
            } else {
                
                newPath = Raphael.transformPath(
                    'M'+ originPos.x + ',' + originPos.y +'L'+ originPos.x + ',' + (originPos.y - rayTrackSize), 
                    'r' + rot + ',' + originPos.x + ',' + originPos.y
                );
                laser = paper.path(newPath).attr(laserAtt);
            }
        }

        laserBox.transform('r' + rot + ',' + originPos.x + ',' + originPos.y);
        statsBox.transform('r' + rot + ',' + originPos.x + ',' + originPos.y + 'r' + (-rot));
        drawReflections();

        rotateCtrl.drag(function(dx, dy, x, y) {
            
            var rx = x - offset.left
                ,ry = y - offset.top
                ;

            rot = 280 + getAngle(originPos.x, originPos.y, rx, ry);
            
            laserBox.transform('r' + rot + ',' + originPos.x + ',' + originPos.y);
            statsBox.transform('r' + rot + ',' + originPos.x + ',' + originPos.y + 'r' + (-rot));
            statsBox.attr('text', stats());

            drawReflections();
            paper.safari();

        }, function(){

            $('body').addClass('rotate');

        }, function(){

            $('body').removeClass('rotate');
            actionCircle.animate({ 'fill-opacity': 0 }, 500);

        }).hover(function(){

            actionCircle.attr({ fill: rotateCtrl.attr('fill') }).animate({ 'fill-opacity': 0.15 }, 500);

        }, function(){

            if (!$('body').hasClass('rotate'))
                actionCircle.animate({ 'fill-opacity': 0 }, 500);
        });

        var ox, oy, odx, ody;

        moveCtrl.drag(function(dx, dy, x, y) {

            var laserBB = laserBox.getBBox();

            // apply simple boundary conditions
            if ((laserBB.y2 + dy - ody) > offset.height){

                dy = Math.min(ody - laserBB.y2 + offset.height, dy);

            } else if ((laserBB.y + dy - ody) < 0){

                dy = Math.max(ody - laserBB.y, dy);
            }

            if ((laserBB.x2 + dx - odx) > offset.width){

                dx = Math.min(odx - laserBB.x2 + offset.width, dx);

            } else if ((laserBB.x + dx - odx) < 0){

                dx = Math.max(odx - laserBB.x, dx);
            }

            if (
                instBBox && 
                (laserBB.x2 + dx - odx) > instBBox.x && 
                laserBB.y < instBBox.y2 && 
                laserBB.y2 > instBBox.y
            ){

                dx = Math.min(odx + instBBox.x - laserBB.x2, dx);
            }

            // move it
            
            originPos.x = ox + dx;
            originPos.y = oy + dy;

            laserBox.transform('r' + rot + ',' + originPos.x + ',' + originPos.y + 't' + dx + ',' + dy);
            statsBox.transform('t' + dx + ',' + dy);
            statsBox.attr('text', stats());
            statsBox.dx = dx;
            statsBox.dy = dy;

            drawReflections();
            paper.safari();

            odx = dx;
            ody = dy;

        }, function(x, y){

            ox = originPos.x;
            oy = originPos.y;

            laserBox.forEach(function(el){

                var type = el.type === "rect";

                el.ox = type ? el.attr("x") : el.attr("cx");
                el.oy = type ? el.attr("y") : el.attr("cy");
            });

        }, function(){

            var dx = originPos.x - ox
                ,dy = originPos.y - oy
                ;

            laserBox.forEach(function(el){

                var type = el.type === "rect"
                    ,ox = type ? el.attr("x") : el.attr("cx")
                    ,oy = type ? el.attr("y") : el.attr("cy")
                    ,att = type ? {
                            x: el.ox + dx, 
                            y: el.oy + dy
                        } : {
                            cx: el.ox + dx, 
                            cy: el.oy + dy
                        }
                    ;

                el.attr(att);
            });

            laserBox.transform('r' + rot + ',' + originPos.x + ',' + originPos.y);

            statsBox.transform('t0,0').attr({
                x: statsBox.attr('x') + statsBox.dx,
                y: statsBox.attr('y') + statsBox.dy
            });

            paper.safari();

            actionCircle.animate({ 'fill-opacity': 0 }, 500);

        }).hover(function(){

            actionCircle.attr({ fill: moveCtrl.attr('fill') }).animate({ 'fill-opacity': 0.15 }, 500);

        }, function(){

            if (!$('body').hasClass('rotate'))
                actionCircle.animate({ 'fill-opacity': 0 }, 500);
        });
    });
});