
$(document).ready(function(){

    // size of container
    var treeWidth = $('.tree').width();
    var treeHeight = $('.tree').height();
    var linesColor = "rgb(194, 225, 232)";

    (function($) {

        $.fn.roots = function(centrumId = 0, file = 'disgen2.json', options = {bakgr: false}) {

            if ( centrumId === "-1" ) {
                centrumId = savedId;
            }

            $(function(){

                var inds, patr = [];

                $.getJSON(file,function(data) {

                    var html = '';
                    var array, genArray = [];

                    console.log('Success');
                    inds = data;

                    if ( centrumId === "-1" ) {
                        centrumId = 0;
                    } else {
                        savedId = centrumId;
                    }

                    html += '<div class="ind0 gen" data-id="' + data[centrumId].id_individual +
                            '" data-far="' + data[centrumId].id_father +
                            '" data-mor="' + data[centrumId].id_mother +
                            '" data-born="' + data[centrumId].date_naissance +
                            '" data-dead="' + data[centrumId].date_deces +
                            '" data-sex="' + data[centrumId].sex +
                            '">' + data[centrumId].first_name + ' ' + data[centrumId].id_patronym + '</div>';

                    array = getParents(1, data[centrumId].id_father, data[centrumId].id_mother); //generation 1
                    html += array[0];
                    genArray = array.slice(1);

                    //generation 1
                    array = getParents(3, genArray[0], genArray[1]);
                    html += array[0];
                    //console.log(array);

                    //generation 2
                    genArray2 = array.slice(1);
                    array = getParents(5, genArray[2], genArray[3]);
                    html += array[0];
                    genArray2 = genArray2.concat( array.slice(1) );

                    //generation 3
                    array = getParents(7, genArray2[0], genArray2[1]);
                    html += array[0];
                    genArray3 = array.slice(1);
                    array = getParents(9, genArray2[2], genArray2[3]);
                    html += array[0];
                    genArray3 = genArray3.concat( array.slice(1) );
                    array = getParents(11, genArray2[4], genArray2[5]);
                    html += array[0];
                    genArray3 = genArray3.concat( array.slice(1) );
                    array = getParents(13, genArray2[6], genArray2[7]);
                    html += array[0];
                    genArray3 = genArray3.concat( array.slice(1) );

                    //generation 4
                    var pos = 15;

                    for (var i=0; i<16; i += 2) {
                        array = getParents(pos, genArray3[i], genArray3[i+1]);
                        html += array[0];
                        pos += 2;
                    }

                    html += '<div class="children" id="showchild" data-id="' + centrumId + '" '
                            + 'data-sex="' + data[centrumId].sex + '"></div>';

                    $('.tree').html(html);
                    $(".tree").animate({opacity: '1'}, 'slow');
                    $('.gen').animate({top: '-=65px'},0);

                    if(options.bakgr) {
                        var ctx = document.getElementById("backlines").getContext("2d");
                        draw(ctx);
                    }

                    //Hover ger individens id och födelsedatum
                    $('[class^=ind]').hover(function() {

                        var a = $(this).data('id');
                        var b = $(this).data('born');

                        a = "<div class='circle'><p>" + a + "</p></div><p>Född:" + b + "</p>";

                        $('<p class="tooltip"></p>')
                            .html(a)
                            .appendTo('body')
                            .fadeIn('slow');
                    }, function() {
                            // Hover out
                            $(this).attr('title', $(this).data('tipText'));
                            $('.tooltip').remove();
                    }).mousemove(function(e) {
                            var mousex = e.pageX - 20;
                            var mousey = e.pageY - 100;
                            $('.tooltip')
                            .css({ top: mousey, left: mousex })
                    });

                    //Dubbelklick gör personen till centrumperson
                    $("[class^=ind]").dblclick(function(){

                        var a = $(this).data('id');
                        $('.tree').roots(a, file);
                    });

                    //Ett klick ger mer information
                    $("[class^=ind]").click(function(){

                        $('.facts').hide();
                        $('.barn').hide();

                        var id = $(this).data('id');
                        var born = $(this).data('born');
                        var dead = $(this).data('dead');
                        var sex = $(this).data('sex');

                        //Hitta antal barn
                        if (id !== -1) {
                            var numsF = inds.reduce(function(n, person) {
                                return n + (person.id_father == id);
                            }, 0);
                            var numsM = inds.reduce(function(n, person) {
                                return n + (person.id_mother == id);
                            }, 0);

                            if ( sex == 0 ) {
                                nums = numsF;
                            } else {
                                nums = numsM;
                            }
                        } else {
                            nums = 0;
                        }

                        var facts = '<div class="facts"><h1>' + $(this).text() + '</h1><hr><p>Född: ' + born + '</p><p>Död: ' + dead + '</p><p>Antal barn: ' +
                                    nums + '</p></div>';

                        $('.tree').prepend(facts);
                    });

                    //Visa barn
                    $("#showchild").click(function(){

                        $('.facts').hide();
                        $('.barn').hide();
                        html = "";

                        var id = $(this).data('id');
                        var sex = $(this).data('sex');
                        id = id.toString();

                        if ( sex == 0 ) {
                            var found = getChildrenF(id);
                        } else {
                            var found = getChildrenM(id);
                        }

                        function getChildrenF(far) {
                          return data.filter(
                            function(data) {
                              return data.id_father == far
                            }
                          );
                        }
                        function getChildrenM(mor) {
                          return data.filter(
                            function(data) {
                              return data.id_mother == mor
                            }
                          );
                        }

                        for (var i = 0; i < found.length; i++){
                            html += '<p>' + found[i].id_individual + ' ' + found[i].first_name + '<br>';
                        }

                        var children = '<div class="barn">' + html + '</div>';

                        $('.tree').prepend(children);
                    });

                    function getParents(start, fatherId, motherId) {

                        var array = [];
                        var fatherFirstName, motherFirstName = "okänd";
                        var fatherLastName, motherLastName = "";
                        var fatherBorn, motherBorn, fatherDead, motherDead = "";
                        var farfarId = "-1", farmorId = "-1", morfarId = "-1", mormorId = "-1";

                        if ( fatherId !== "-1"  ) {

                            farfarId = inds[fatherId].id_father;
                            farmorId = inds[fatherId].id_mother;
                            fatherFirstName = inds[fatherId].first_name;
                            fatherLastName = inds[fatherId].id_patronym;
                            fatherBorn = inds[fatherId].date_naissance;
                            fatherDead = inds[fatherId].date_deces;
                        }
                        if ( typeof fatherFirstName === 'undefined' ) {
                            fatherFirstName = "okänd";
                            fatherLastName = "";
                        }

                        if ( motherId !== "-1" ) {

                            morfarId = inds[motherId].id_father;
                            mormorId = inds[motherId].id_mother;
                            motherFirstName = inds[motherId].first_name;
                            motherLastName = inds[motherId].id_patronym;
                            motherBorn = inds[motherId].date_naissance;
                            motherDead = inds[motherId].date_deces;
                        }

                        var html = '<div class="ind' + start + ' gen" data-id="' + fatherId +
                                    '" data-far="' + farfarId + '" data-mor="' + farmorId + '" data-born="' + fatherBorn + '" data-dead="' + fatherDead +
                                    '" data-sex="0"' +
                                    '">' + fatherFirstName + ' ' + fatherLastName + '</div>'

                        start++;

                        html += '<div class="ind' + start + ' gen" data-id="' + motherId +
                                    '" data-far="' + morfarId + '" data-mor="' + mormorId + '" data-born="' + motherBorn + '" data-dead="' + motherDead +
                                    '" data-sex="1"' +
                                    '">' + motherFirstName + ' ' + motherLastName + '</div>'

                        array = [ html, farfarId, farmorId, morfarId, mormorId ];
                        return array;
                    }

                    function draw(ctx) {
                        ctx.strokeStyle = linesColor;
                        // layer2/Path
                        ctx.save();
                        ctx.beginPath();
                        ctx.moveTo(0.0, 216.0);
                        ctx.lineTo(18.7, 216.0);
                        ctx.bezierCurveTo(32.2, 216.0, 44.8, 209.0, 51.3, 197.2);
                        ctx.bezierCurveTo(51.6, 196.8, 51.8, 196.4, 52.0, 196.0);
                        ctx.bezierCurveTo(55.7, 188.5, 57.2, 154.6, 57.8, 138.1);
                        ctx.bezierCurveTo(58.0, 129.0, 62.4, 120.4, 69.8, 115.2);
                        ctx.bezierCurveTo(73.2, 112.8, 77.3, 111.0, 82.0, 111.0);
                        ctx.lineWidth = 6.0;
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(0.0, 216.0);
                        ctx.lineTo(18.7, 216.0);
                        ctx.bezierCurveTo(32.2, 216.0, 44.8, 223.0, 51.3, 234.8);
                        ctx.bezierCurveTo(51.6, 235.2, 51.8, 235.6, 52.0, 236.0);
                        ctx.bezierCurveTo(55.7, 243.5, 57.2, 277.4, 57.8, 293.9);
                        ctx.bezierCurveTo(58.0, 303.0, 62.4, 311.6, 69.8, 316.8);
                        ctx.bezierCurveTo(73.2, 319.2, 77.3, 321.0, 82.0, 321.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(261.0, 115.0);
                        ctx.lineTo(273.6, 115.0);
                        ctx.bezierCurveTo(282.6, 115.0, 291.1, 111.6, 295.4, 105.9);
                        ctx.bezierCurveTo(295.6, 105.7, 295.7, 105.5, 295.9, 105.3);
                        ctx.bezierCurveTo(298.4, 101.6, 299.4, 85.2, 299.7, 77.2);
                        ctx.bezierCurveTo(299.9, 72.7, 302.8, 68.6, 307.8, 66.0);
                        ctx.bezierCurveTo(310.1, 64.9, 312.9, 64.0, 316.0, 64.0);
                        ctx.lineWidth = 5.0;
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(261.0, 115.0);
                        ctx.lineTo(273.6, 115.0);
                        ctx.bezierCurveTo(282.6, 115.0, 291.1, 118.4, 295.4, 124.1);
                        ctx.bezierCurveTo(295.6, 124.3, 295.7, 124.5, 295.9, 124.7);
                        ctx.bezierCurveTo(298.4, 128.4, 299.4, 144.8, 299.7, 152.8);
                        ctx.bezierCurveTo(299.9, 157.3, 302.8, 161.4, 307.8, 164.0);
                        ctx.bezierCurveTo(310.1, 165.1, 312.9, 166.0, 316.0, 166.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(261.0, 329.0);
                        ctx.lineTo(273.6, 329.0);
                        ctx.bezierCurveTo(282.6, 329.0, 291.1, 325.6, 295.4, 319.9);
                        ctx.bezierCurveTo(295.6, 319.7, 295.7, 319.5, 295.9, 319.3);
                        ctx.bezierCurveTo(298.4, 315.6, 299.4, 299.2, 299.7, 291.2);
                        ctx.bezierCurveTo(299.9, 286.7, 302.8, 282.6, 307.8, 280.0);
                        ctx.bezierCurveTo(310.1, 278.9, 312.9, 278.0, 316.0, 278.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(261.0, 329.0);
                        ctx.lineTo(273.6, 329.0);
                        ctx.bezierCurveTo(282.6, 329.0, 291.1, 332.4, 295.4, 338.1);
                        ctx.bezierCurveTo(295.6, 338.3, 295.7, 338.5, 295.9, 338.7);
                        ctx.bezierCurveTo(298.4, 342.4, 299.4, 358.8, 299.7, 366.8);
                        ctx.bezierCurveTo(299.9, 371.3, 302.8, 375.4, 307.8, 378.0);
                        ctx.bezierCurveTo(310.1, 379.1, 312.9, 380.0, 316.0, 380.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(517.6, 48.0);
                        ctx.lineTo(527.3, 48.0);
                        ctx.bezierCurveTo(534.2, 48.0, 540.8, 46.5, 544.1, 43.9);
                        ctx.bezierCurveTo(544.3, 43.8, 544.4, 43.7, 544.5, 43.6);
                        ctx.bezierCurveTo(546.4, 42.0, 547.2, 34.5, 547.5, 30.9);
                        ctx.bezierCurveTo(547.6, 28.9, 549.8, 27.1, 553.7, 25.9);
                        ctx.bezierCurveTo(555.5, 25.4, 557.6, 25.0, 560.0, 25.0);
                        ctx.lineWidth = 4.0;
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(517.6, 48.0);
                        ctx.lineTo(527.3, 48.0);
                        ctx.bezierCurveTo(534.2, 48.0, 540.8, 49.5, 544.1, 52.1);
                        ctx.bezierCurveTo(544.3, 52.2, 544.4, 52.3, 544.5, 52.4);
                        ctx.bezierCurveTo(546.4, 54.0, 547.2, 61.5, 547.5, 65.1);
                        ctx.bezierCurveTo(547.6, 67.1, 549.8, 68.9, 553.7, 70.1);
                        ctx.bezierCurveTo(555.5, 70.6, 557.6, 71.0, 560.0, 71.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(517.1, 175.0);
                        ctx.lineTo(526.8, 175.0);
                        ctx.bezierCurveTo(533.8, 175.0, 540.3, 173.5, 543.7, 170.9);
                        ctx.bezierCurveTo(543.8, 170.8, 543.9, 170.7, 544.0, 170.6);
                        ctx.bezierCurveTo(546.0, 169.0, 546.8, 161.5, 547.0, 157.9);
                        ctx.bezierCurveTo(547.2, 155.9, 549.4, 154.1, 553.2, 152.9);
                        ctx.bezierCurveTo(555.0, 152.4, 557.1, 152.0, 559.6, 152.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(517.1, 175.0);
                        ctx.lineTo(526.8, 175.0);
                        ctx.bezierCurveTo(533.8, 175.0, 540.3, 176.5, 543.7, 179.1);
                        ctx.bezierCurveTo(543.8, 179.2, 543.9, 179.3, 544.0, 179.4);
                        ctx.bezierCurveTo(546.0, 181.0, 546.8, 188.5, 547.0, 192.1);
                        ctx.bezierCurveTo(547.2, 194.1, 549.4, 195.9, 553.2, 197.1);
                        ctx.bezierCurveTo(555.0, 197.6, 557.1, 198.0, 559.6, 198.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(518.6, 281.0);
                        ctx.lineTo(528.3, 281.0);
                        ctx.bezierCurveTo(535.2, 281.0, 541.8, 279.5, 545.1, 276.9);
                        ctx.bezierCurveTo(545.3, 276.8, 545.4, 276.7, 545.5, 276.6);
                        ctx.bezierCurveTo(547.4, 275.0, 548.2, 267.5, 548.5, 263.9);
                        ctx.bezierCurveTo(548.6, 261.9, 550.8, 260.1, 554.7, 258.9);
                        ctx.bezierCurveTo(556.5, 258.4, 558.6, 258.0, 561.0, 258.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(518.6, 281.0);
                        ctx.lineTo(528.3, 281.0);
                        ctx.bezierCurveTo(535.2, 281.0, 541.8, 282.5, 545.1, 285.1);
                        ctx.bezierCurveTo(545.3, 285.2, 545.4, 285.3, 545.5, 285.4);
                        ctx.bezierCurveTo(547.4, 287.0, 548.2, 294.5, 548.5, 298.1);
                        ctx.bezierCurveTo(548.6, 300.1, 550.8, 301.9, 554.7, 303.1);
                        ctx.bezierCurveTo(556.5, 303.6, 558.6, 304.0, 561.0, 304.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(518.1, 413.0);
                        ctx.lineTo(527.8, 413.0);
                        ctx.bezierCurveTo(534.8, 413.0, 541.3, 411.5, 544.7, 408.9);
                        ctx.bezierCurveTo(544.8, 408.8, 544.9, 408.7, 545.0, 408.6);
                        ctx.bezierCurveTo(547.0, 407.0, 547.8, 399.5, 548.0, 395.9);
                        ctx.bezierCurveTo(548.2, 393.9, 550.4, 392.1, 554.2, 390.9);
                        ctx.bezierCurveTo(556.0, 390.4, 558.1, 390.0, 560.6, 390.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(518.1, 413.0);
                        ctx.lineTo(527.8, 413.0);
                        ctx.bezierCurveTo(534.8, 413.0, 541.3, 414.5, 544.7, 417.1);
                        ctx.bezierCurveTo(544.8, 417.2, 544.9, 417.3, 545.0, 417.4);
                        ctx.bezierCurveTo(547.0, 419.0, 547.8, 426.5, 548.0, 430.1);
                        ctx.bezierCurveTo(548.2, 432.1, 550.4, 433.9, 554.2, 435.1);
                        ctx.bezierCurveTo(556.0, 435.6, 558.1, 436.0, 560.6, 436.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(755.6, 25.0);
                        ctx.lineTo(780.3, 25.0);
                        ctx.bezierCurveTo(787.2, 25.0, 793.8, 23.5, 797.1, 20.9);
                        ctx.bezierCurveTo(797.3, 20.8, 797.4, 20.7, 797.5, 20.6);
                        ctx.bezierCurveTo(799.4, 19.0, 800.2, 11.5, 800.5, 7.9);
                        ctx.bezierCurveTo(800.6, 5.9, 802.8, 4.1, 806.7, 2.9);
                        ctx.bezierCurveTo(808.5, 2.4, 814.6, 2.0, 817.0, 2.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(755.6, 25.0);
                        ctx.lineTo(780.3, 25.0);
                        ctx.bezierCurveTo(787.2, 25.0, 791.6, 24.4, 795.0, 27.0);
                        ctx.bezierCurveTo(795.1, 27.1, 797.3, 28.2, 797.5, 28.3);
                        ctx.bezierCurveTo(801.8, 30.5, 804.3, 32.0, 815.5, 31.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(755.0, 70.0);
                        ctx.lineTo(779.7, 70.0);
                        ctx.bezierCurveTo(786.6, 70.0, 793.2, 71.5, 796.6, 74.1);
                        ctx.bezierCurveTo(796.7, 74.2, 796.8, 74.3, 796.9, 74.4);
                        ctx.bezierCurveTo(798.9, 76.0, 799.6, 83.5, 799.9, 87.1);
                        ctx.bezierCurveTo(800.0, 89.1, 802.3, 90.9, 806.1, 92.1);
                        ctx.bezierCurveTo(807.9, 92.6, 810.0, 93.0, 812.4, 93.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(756.6, 151.0);
                        ctx.lineTo(781.3, 151.0);
                        ctx.bezierCurveTo(788.2, 151.0, 794.8, 149.5, 798.1, 146.9);
                        ctx.bezierCurveTo(798.3, 146.8, 798.4, 146.7, 798.5, 146.6);
                        ctx.bezierCurveTo(800.4, 145.0, 801.2, 137.5, 801.5, 133.9);
                        ctx.bezierCurveTo(801.6, 131.9, 803.8, 130.1, 807.7, 128.9);
                        ctx.bezierCurveTo(809.5, 128.4, 811.6, 128.0, 814.0, 128.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(756.0, 196.0);
                        ctx.lineTo(780.7, 196.0);
                        ctx.bezierCurveTo(787.6, 196.0, 794.2, 197.5, 797.6, 200.1);
                        ctx.bezierCurveTo(797.7, 200.2, 797.8, 200.3, 797.9, 200.4);
                        ctx.bezierCurveTo(799.9, 202.0, 800.6, 209.5, 800.9, 213.1);
                        ctx.bezierCurveTo(801.0, 215.1, 803.3, 216.9, 807.1, 218.1);
                        ctx.bezierCurveTo(808.9, 218.6, 811.0, 219.0, 813.4, 219.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(756.6, 259.0);
                        ctx.lineTo(781.3, 259.0);
                        ctx.bezierCurveTo(788.2, 259.0, 794.8, 257.5, 798.1, 254.9);
                        ctx.bezierCurveTo(798.3, 254.8, 798.4, 254.7, 798.5, 254.6);
                        ctx.bezierCurveTo(800.4, 253.0, 801.2, 245.5, 801.5, 241.9);
                        ctx.bezierCurveTo(801.6, 239.9, 803.8, 238.1, 807.7, 236.9);
                        ctx.bezierCurveTo(809.5, 236.4, 811.6, 236.0, 814.0, 236.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(756.0, 304.0);
                        ctx.lineTo(780.7, 304.0);
                        ctx.bezierCurveTo(787.6, 304.0, 794.2, 305.5, 797.6, 308.1);
                        ctx.bezierCurveTo(797.7, 308.2, 797.8, 308.3, 797.9, 308.4);
                        ctx.bezierCurveTo(799.9, 310.0, 800.6, 317.5, 800.9, 321.1);
                        ctx.bezierCurveTo(801.0, 323.1, 803.3, 324.9, 807.1, 326.1);
                        ctx.bezierCurveTo(808.9, 326.6, 811.0, 327.0, 813.4, 327.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(757.6, 389.0);
                        ctx.lineTo(782.3, 389.0);
                        ctx.bezierCurveTo(789.2, 389.0, 795.8, 387.5, 799.1, 384.9);
                        ctx.bezierCurveTo(799.3, 384.8, 799.4, 384.7, 799.5, 384.6);
                        ctx.bezierCurveTo(801.4, 383.0, 802.2, 375.5, 802.5, 371.9);
                        ctx.bezierCurveTo(802.6, 369.9, 804.8, 368.1, 808.7, 366.9);
                        ctx.bezierCurveTo(810.5, 366.4, 812.6, 366.0, 815.0, 366.0);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(757.0, 429.3);
                        ctx.lineTo(781.7, 429.3);
                        ctx.bezierCurveTo(788.6, 429.3, 795.2, 430.8, 798.6, 433.4);
                        ctx.bezierCurveTo(798.7, 433.5, 798.8, 433.6, 798.9, 433.7);
                        ctx.bezierCurveTo(800.9, 435.3, 801.6, 442.7, 801.9, 446.3);
                        ctx.bezierCurveTo(802.0, 448.3, 804.3, 450.2, 808.1, 451.4);
                        ctx.bezierCurveTo(809.9, 451.9, 812.0, 452.3, 814.4, 452.3);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(817.9, 63.0);
                        ctx.lineTo(808.2, 63.0);
                        ctx.bezierCurveTo(801.3, 63.0, 796.8, 64.2, 793.5, 66.7);
                        ctx.bezierCurveTo(793.3, 66.8, 791.1, 67.9, 791.0, 68.0);
                        ctx.bezierCurveTo(786.7, 70.2, 769.2, 70.7, 758.0, 69.7);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(756.7, 151.7);
                        ctx.lineTo(781.4, 151.7);
                        ctx.bezierCurveTo(788.3, 151.7, 792.7, 151.1, 796.1, 153.7);
                        ctx.bezierCurveTo(796.2, 153.8, 798.5, 154.9, 798.6, 155.0);
                        ctx.bezierCurveTo(802.9, 157.2, 805.4, 158.7, 816.6, 157.7);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(819.0, 189.0);
                        ctx.lineTo(809.3, 189.0);
                        ctx.bezierCurveTo(802.4, 189.0, 797.9, 190.2, 794.6, 192.7);
                        ctx.bezierCurveTo(794.4, 192.8, 792.2, 193.9, 792.1, 194.0);
                        ctx.bezierCurveTo(787.8, 196.2, 770.3, 196.7, 759.1, 195.7);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(757.0, 260.1);
                        ctx.lineTo(781.7, 260.1);
                        ctx.bezierCurveTo(788.6, 260.1, 793.1, 259.5, 796.4, 262.1);
                        ctx.bezierCurveTo(796.6, 262.1, 798.8, 263.3, 798.9, 263.3);
                        ctx.bezierCurveTo(803.2, 265.6, 805.7, 267.0, 816.9, 266.1);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(816.9, 297.8);
                        ctx.lineTo(807.2, 297.8);
                        ctx.bezierCurveTo(800.3, 297.8, 795.8, 299.0, 792.5, 301.5);
                        ctx.bezierCurveTo(792.3, 301.6, 790.1, 302.8, 790.0, 302.8);
                        ctx.bezierCurveTo(785.7, 305.0, 768.2, 305.5, 757.0, 304.5);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(758.1, 389.1);
                        ctx.lineTo(782.8, 389.1);
                        ctx.bezierCurveTo(789.7, 389.1, 794.2, 388.5, 797.5, 391.1);
                        ctx.bezierCurveTo(797.7, 391.1, 799.9, 392.3, 800.0, 392.3);
                        ctx.bezierCurveTo(804.3, 394.6, 806.8, 396.0, 818.0, 395.1);
                        ctx.stroke();

                        // layer2/Path
                        ctx.beginPath();
                        ctx.moveTo(818.0, 422.0);
                        ctx.lineTo(808.3, 422.0);
                        ctx.bezierCurveTo(801.4, 422.0, 796.9, 423.2, 793.6, 425.7);
                        ctx.bezierCurveTo(793.4, 425.8, 791.2, 426.9, 791.1, 427.0);
                        ctx.bezierCurveTo(786.8, 429.2, 769.3, 429.7, 758.1, 428.7);
                        ctx.stroke();
                        ctx.restore();
                    }

                }).fail(function(){
                    console.log('Error loading disgen data!');
                });
            });
        };

    }) (jQuery);

    $('.tree').roots(139, 'disgen2.json', {bakgr: true}); //269

    //Exempel på antavlor med olika json-filer
    $("#ana1").click(function(){
        $('.tree').roots(40, 'disgen2.json');
    });

    $("#ana2").click(function(){
        $('.tree').roots(0, 'afEkna.json');
    });
    $("#ana4").click(function(){
        $('.tree').roots(0, 'afEkna.json');
    });


});



