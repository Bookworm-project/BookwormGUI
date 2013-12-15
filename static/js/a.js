$(document).ready(function() {
    // number of queries
    var rows = 0;
    // chart data
    var data = [];
    // book counts
    var cts = [];
    // metadata for queries
    var metadata = [];
    // load options into page
    var options = undefined;
    // box colors
    var colors = ['', '128, 177, 211', '251, 128, 114', '179, 222, 105', '141, 211, 199', '190, 186, 218', '252, 205, 229', '217, 217, 217'];
    var hexColors = ['', '#1F77B4', '#FF7F0E', '#2CA02C', '#D62728', '#9467BD', '#8C564B', '#E377C2', '#7F7F7F', '#BCBD22', '#17BECF'];
    //resize
    var resizing = null;
    //different kinds of time scales
    var time_array = [];
    var year_option;

    $(window).resize(function() {
        clearTimeout(resizing);
        resizing = setTimeout(doneResizing, 200);
    });

    $('#chart_wrapper').css('width', "" + ($(window).width() - 50) + "px");
    $('#chart').css('width', "" + ($(window).width() - 50) * .98 + "px");
    $('#chart').css('margin-left', "" + (($(window).width() - $('#chart').width()) / 2.0 - 20) + "px");
    doneResizing = function() {
        $('#chart_wrapper').css('width', "" + ($(window).width() - 50) + "px");
        $('#chart').css('width', "" + ($(window).width() - 55) * .98 + "px");
        $('#chart').css('margin-left', "" + (($(window).width() - $('#chart').width()) / 2.0 - 20) + "px");
        return renderChart();
    };

    // initialize options and run first query
    $.ajax({
        url: 'static/options.json',
        dataType: 'json',
        success: function(response) {
            options = response;
            // console.log('loaded options');
            // console.log(options);
            firstQuery();
            runQuery();
        }
    });

    // get JSON from URL
    var getHash = function() {
            var link = $.URLDecode((window.location.href).split("?")[1]);
            if (link) {
                link = link.replace(/#/g, '');
                var ps = JSON.parse(link);
                //defaults is the first of the saved searches
                var def = options['default_search'][0]
                // load attributes from default query
                _(def).each(function(v, key) {
                    if (!ps[key]) {
                        ps[key] = def[key];
                    }
                });
                return ps;
            }
            //choose a random default search if none is set.
            else return options['default_search'][Math.floor(Math.random() * options['default_search'].length)];
        }

    // run first query - either from URL or default query
    var firstQuery = function() {
            //replace website text:
            document.getElementById('sourceName1').innerHTML = options['settings']['sourceName'];
            document.getElementById('sourceName2').innerHTML = options['settings']['sourceName'];
            document.title = "bookworm " + options['settings']['sourceName'];
            document.getElementById('countName1').innerHTML = "% of " + options['settings']['itemName'] + "s";
            document.getElementById('countName2').innerHTML = options['settings']['itemName'] + " count";
            document.getElementById('itemName').innerHTML = options['settings']['itemName'];
            document.getElementById('sourceURL').innerHTML = '<a href=http://' + options['settings']['sourceURL'] + '>' + options['settings']['sourceURL'] + '</a>';
            var params = getHash();
            var search_limits = params['search_limits'];
            // initialize UI rows
            _.each(search_limits, function(el) {
                addRow();
            });
            // populate term boxes
            $('input.term').each(function(i, v) {
                $(v).val(search_limits[i]['word'][0].split('+').join(' '));
            });
            initializeSelectBoxes();
            // TODO: add slider
            newSliders();
            // TODO: populate forms
            // case sensitivity
            $('.btn', '#colltype').filter(function(i, v) {
                return $(v).data('val') == params['words_collation'];
            }).addClass('active');
            // word count type
            $('.btn', '#collationtype').filter(function(i, v) {
                return $(v).data('val') == params['counttype'];
            }).addClass('active');
            // time value
            $('#year-slider').slider('values', params['time_limits']);
            fixTime();
            params['timeUnit'] = year_option;
            // smoothing value
            $('#smoothing-slider').slider('value', params['smoothingSpan']);
            $('#smoothing-val').text(getSmoothing(params['smoothingSpan']) + " " + params['timeUnit']['unit'] + "s");
            //metadata = params['category_data'];
            $('.edit-box').each(function(i, v) {
                $(v).find('tr.datarow').each(function(r, row) {
                    var key = $(row).data('name');
                    _(search_limits[i][key]).each(function(k) {
                        $('option[value="' + k + '"]', row).attr('selected', 'selected');
                    });
                    $(row).find('select').trigger('liszt:updated');
                });
            });
            fixSlugs();
        }
    $('#search_queries').on('click', '.box_plus', function(event) {
        var row = $(this).parents('.search-row').data('row');
        addRow(true, row);
    });

    // add row to query table
    var addRow = function(copy, row) {
            rows++;
            var prevterm = $("#search_queries table.top tr.search-row:last td.terms-td input.term").attr('value');
            if (row) {
                var searchRow = _.find($("tr.search-row"), function(v) {
                    return $(v).data('row') == row;
                })
                prevterm = $('input.term', searchRow).attr('value');
            }
            var rowHTML = "<tr class=search-row data-row=" + rows + ">";
            rowHTML += "<td class=terms-td><input placeholder='Search terms' class=term></input></td>";
            rowHTML += "<td><p class=tbl-text>in</sp></td>";
            rowHTML += "<td class=box-td></td>";
            rowHTML += "<td class=add-td></td>";
            rowHTML += "</tr>";
            if (!row) $('#search_queries table.top').append(rowHTML);
            else $(searchRow).after(rowHTML);
            if (row) {
                //      console.log('newRow');
                var newRow = _.find($("tr.search-row"), function(v) {
                    return $(v).data('row') == rows;
                })
                var newCatBox = $(newRow).find('td.box-td');
            }
            // clone category box
            if (!row) {
                $('#category_box_template').clone().removeClass('category_box_template').addClass('category_box').attr('id', "cat_box_" + rows).appendTo('#search_queries table.top tr:last td.box-td');
            } else {
                //      console.log(newCatBox);
                $(newCatBox).append(
                $('#category_box_template').clone().removeClass('category_box_template').addClass('category_box').attr('id', "cat_box_" + rows));
            }
            $("#cat_box_" + rows + " .box_data").html("All " + options['settings']['itemName'] + "s");
            var last_cat = _.last($('.edit-box'));
            if (row) last_cat = _.find($('.edit-box'), function(v) {
                return $(v).data('row') == row;
            });
            var last_cats = {};
            $(last_cat).find('tr.datarow').each(function(i2, v2) {
                var singlecats = [];
                $(v2).find('option:selected').each(function(i3, v3) {
                    singlecats.push($(v3).val());
                });
                last_cats[$(v2).data('name')] = singlecats;
            });
            // add edit dropdown
            newEditBox(rows);
            // copy values if flag is set
            if (copy) {
                $("input.term", newRow).val(prevterm);
                var new_cat = _.last($('.edit-box'));
                //      console.log(new_cat);
                $("select", new_cat).each(function(i2, v2) {
                    var name = $(v2).parents('tr.datarow').data('name');
                    _.each(last_cats[name], function(elv) {
                        //          console.log(elv);
                        $("option[value='" + elv + "']", v2).attr('selected', 'selected');
                    });
                    $(v2).trigger('liszt:updated');
                });
            }
            // activate dropdown in metadatabox
            $('#search_queries').on('click', '#cat_box_' + rows + ' a.box_data', function(event) {
                // fix box positions
                fixEditBoxPositions();
                var row = $(this).parents('tr.search-row').data('row');
                // hide all other edit boxes
                $(_.filter($('.edit-box'), function(el) {
                    return $(el).data('row') != row;
                })).each(function(i, v) {
                    $(v).hide();
                });
                // determine if relevant one is open, handle toggling
                //TODO: fix this behavior
                var editId = '#edit_box_' + row;
                var editOpen = $(editId).is(':visible');
                inEdit = function(evt) {
                    //        console.log('here');
                    if ($(evt.target).parents(editId).length == 0) hideEdit();
                }
                hideEdit = function() {
                    $('#edit_box_' + row).hide();
                    $(document).off('click', 'body', inEdit);
                }
                if (!editOpen) {
                    hidePopups();
                    $('#edit_box_' + row).show();
                    $(document).on('click', 'body', inEdit);
                } else {
                    hideEdit();
                }
                return false;
            });
            // fix remaining UI elements
            fixSlugs();
            fixAddButton();
        }
    // add edit corpus div
    var newEditBox = function(num) {
            var divName = "edit_box_" + num;
            popups.push('#' + divName);
            var divHTML = $('<div></div>').attr('id', divName).addClass('edit-box').data('row', num).css('display', 'none').html('<span class=subtitle>Restrict search to the following ' + options['settings']['itemName'] + 's</span>');
            // add options table
            var table = "<table></table>";
            var datatypes = ['categorical']; //, 'hierarchical'];
            var opts = _.filter(options['ui_components'], function(v) {
                return _.include(datatypes, v['type']);
            });
            _.each(opts, function(opt) {
                // build each row of table
                row = $(row).append($('<td></td>').html(opt['name']).addClass('edit-box-label'));
                var select = '';
                if (opt['type'] == 'categorical') {
                    var elts = _(opt['categorical']['sort_order']).map(function(key) {
                        return opt['categorical']['descriptions'][key];
                    });
                    var selectHTML = "<select multiple=multiple style='width:350px;'>";
                    selectHTML += "<% _(elts).each(function(el){ %> <option value='<%= el['dbcode']%>'><%= el['name']%></option><% }); %>";
                    selectHTML += "</select>";
                    select = _(selectHTML).template({
                        elts: elts
                    });
                }
                var rowHTML = '<tr class=datarow data-name="<%= dbcode %>">';
                rowHTML += "<td class=edit-box-label><%= label%></td>";
                rowHTML += "<td class=edit-box-select><%= select %></td>";
                rowHTML += '</tr>';
                var row = _(rowHTML).template({
                    label: opt['name'],
                    select: select,
                    dbcode: opt['dbfield']
                });
                table = $(table).append(row);
            });
            divHTML = $(divHTML).append(table);
            $('body').append(divHTML);
            fixEditBoxPositions();
            $('#' + divName + ' select').data('placeholder', 'All').chosen();
        }
        // fix positions of edit boxes, placing them under their respected links
    var fixEditBoxPositions = function() {
            _($('.edit-box')).each(function(v, i) {
                var i = $(v).data('row');
                editBox = '#edit_box_' + i;
                // get corresponding metadata box
                metaBox = $(_.filter($('tr.search-row'), function(r) {
                    return $(r).data('row') == i;
                })).find('.category_box');
                var newTop = $(metaBox).position().top + $(metaBox).height() + 2;
                var newLeft = $(metaBox).position().left;
                $(editBox).css('top', newTop).css('left', newLeft);
            });
        }
        // html for search button
    var search_button = "<button class='btn btn-primary search-btn'>Search</button>";
    // fix add button placement
    var fixAddButton = function() {
            $('.add-td').html('');
            $('#search_queries tr.search-row:last td.add-td').html(search_button);
        }
    $('#search_queries').on('click', '.add-query', function(event) {
        addRow(true);
    });
    // remove x button on first line
    var fixXButton = function() {}
        // toggling code for popup divs
    var toggler = function(link, target) {
            $(link).click(function(event) {
                var inTarget = function(evt) {
                        if ($(evt.target).parents(target).length == 0) hideTarget();
                    }
                var hideTarget = function() {}
            });
        }
        // about dropdown
        $('.about').click(function(event) {
            inSettings = function(evt) {
                //console.log('inSettings');
                if ($(evt.target).parents('#about').length == 0) hideSettings();
            }
            hideSettings = function() {
                $('.about-img').css('background-color', '#ffffff');
                $('#about').hide();
                $(document).off('click', 'body', inSettings);
            }
            if ($('#about').is(':visible')) {
                hideSettings();
            } else {
                hidePopups();
                $('.about-img').css('background-color', '#abcdef');
                $('#about').show();
                $(document).on('click', 'body', inSettings);
            }
            return false;
        });
    // settings dropdown
    $('.advanced').click(function(event) {
        inSettings = function(evt) {
            //console.log('inSettings');
            if ($(evt.target).parents('#settings').length == 0) hideSettings();
        }
        hideSettings = function() {
            $('.advanced-img').css('background-color', '#ffffff');
            $('#settings').hide();
            $(document).off('click', 'body', inSettings);
        }
        if ($('#settings').is(':visible')) {
            hideSettings();
        } else {
            hidePopups();
            $('.advanced-img').css('background-color', '#abcdef');
            $('#settings').show();
            $(document).on('click', 'body', inSettings);
        }
        return false;
    });
    // initialize slider
    newSliders = function() {
        // time sliders
        var _j;
        if (time_array.length > 0) {
            year_option = time_array[0];
            for (_j = 0; _j < time_array.length; _j++) {
                if (time_array[_j]['dbfield'] == $('#time_measure').val()) {
                    year_option = time_array[_j];
                }
            }
        } else {
            year_option = _(options['ui_components']).filter(function(v) {
                return v['type'] == 'time';
            })[0];
        }
        $('#year-slider').slider({
            range: true,
            min: year_option['range'][0],
            max: year_option['range'][1],
            values: year_option['initial'],
            slide: function(event, ui) {
                valuemin = ui.values[0];
                valuemax = ui.values[1];
                fixTime(valuemin, valuemax);
            }
        });
        fixTime();
        var prevvalue = $('#smoothing-slider').slider('value');
        var newvalue = 0;
        if (prevvalue != null) {
            newvalue = prevvalue;
        }
        // smoothing slider
        $('#smoothing-slider').slider({
            min: 0,
            max: 14,
            value: newvalue,
            slide: function(event, ui) {
                $('#smoothing-val').text("" + getSmoothing(ui.value) + " " + year_option['unit'] + "s");
            }
        });
        $('#smoothing-slider').css('width', '240px');
        $('#smoothing-val').text(newvalue + " " + year_option['unit'] + "s");
    }
    initializeSelectBoxes = function() {
        var option_array = options['ui_components'];
        $('.group_select_div').append('<select class=group_select> </select>');
        $('.limit_select_div').append('<select class=group_select> </select>');
        for (_j = 0, _len2 = option_array.length; _j < _len2; _j++) {
            option = option_array[_j];
            if (option['type'] === 'time') {
                time_array.push(option);
            }
        }
        if (time_array.length > 1) {
            $('#labeltime').append("<label for=yeartype>Time:</label>");
            $('#timetype').append("<select id=time_measure onChange=newSliders()>");
            for (_j = 0, _len2 = time_array.length; _j < _len2; _j++) {
                option = time_array[_j];
                $('#time_measure').append("<option value='" + option['dbfield'] + "'>" + option['name'] + "</option>");
            }
            $('#yeartype').append("</select>");
        }
        //    addCatBox();
        // return fixGroupSelect();
    };
    fixTime = function() {
        var v = $('#year-slider').slider('values');
        var t = $('#time_measure').val();
        if (t == "date_month") {
            var dateparts1 = getDate(v[0]).toDateString().substring(4).split(' ');
            var dateparts2 = getDate(v[1]).toDateString().substring(4).split(' ');
            var datestr1 = dateparts1[0] + " " + dateparts1[2];
            var datestr2 = dateparts2[0] + " " + dateparts2[2]
            $('#time-val').text("" + datestr1 + " - " + datestr2);
        } else {
            $('#time-val').text("" + v[0] + " - " + v[1]);
        }
    }
    // delete a row
    $('#search_queries').on('click', '.box_x', function(event) {
        var row = $(this).parents('tr.search-row').data('row');
        // remove corresponding edit box
        $('#edit_box_' + row).remove();
        $(this).parents('tr.search-row').remove();
        // fix UI elements
        fixAddButton();
        popups = _(popups).without('#edit_box_' + row);
    });
    // date util function
    getDate = function(intval) {
        var minDate = new Date();
        minDate.setUTCFullYear(0000);
        minDate.setUTCMonth(0);
        minDate.setUTCDate(1);
        minDate.setUTCSeconds(0);
        minDate.setUTCMilliseconds(0);
        minDate.setDate(minDate.getDate() + intval);
        return minDate;
    };
    // smoothing span util function
    getSmoothing = function(intval) {
        if (intval <= 10) {
            return intval;
        } else if (intval == 11) {
            return 12;
        } else if (intval == 12) {
            return 18;
        } else if (intval == 13) {
            return 24;
        } else {
            return 36;
        }
    };
    // fix colors of metadata boxes
    fixColors = function() {
        $('.category_box').each(function(i, v) {
            return $(this).find("td").css('background-color', 'rgba(' + colors[i + 1] + ",1)");
        });
    }
    // scrap code
    $(document).on('click', '#blah', function(event) {
        runQuery();
    });
    // construct ajax DB query
    buildQuery = function() {
        var time_measure;
        if (time_array.length == 1) {
            time_measure = time_array[0]['dbfield'];
        } else if (time_array.length > 1) {
            time_measure = $('#time_measure').val();
        }
        // initial query object without search_limits
        query = {
            time_measure: time_measure,
            time_limits: $('#year-slider').slider("values"),
            counttype: $('.active', '#collationtype').data('val'),
            words_collation: $('.active', '#colltype').data('val'),
            smoothingSpan: getSmoothing($('#smoothing-slider').slider('value')),
            database: options['settings']['dbname'],
        }
        // construct search_limits by scraping
        var limits = [];
        var terms = [];
        $('input.term').each(function(i, v) {
            terms.push($(v).val());
        });
        var cats = [];
        $('.search-row').each(function(i, v) {
            var row = $(v).data('row');
            var edit_box = _.find($('.edit-box'), function(el) {
                return $(el).data('row') == row;
            });
            var subcats = {};
            $(edit_box).find('tr.datarow').each(function(i2, v2) {
                var singlecats = [];
                $(v2).find('option:selected').each(function(i3, v3) {
                    singlecats.push($(v3).val());
                });
                subcats[$(v2).data('name')] = singlecats;
            });
            cats.push(subcats);
        });
        for (var i = 0; i < terms.length; i++) {
            var limit = {
                word: [terms[i]]
            };
            var cat = cats[i]
            for (var key in cat) {
                if (cat[key].length != 0) limit[key] = cat[key];
            }
            limits.push(limit);
        }
        query['search_limits'] = limits;
        return query;
    }
    // send query to db via ajax
    runQuery = function() {
        if (!validateQuery()) return false;
        var query = buildQuery();
        //      console.log('query constructed');
        //      console.log(JSON.stringify(query));
        $('#permalink').find('input').val(permQuery());
        $('#chart').html('');
        $('#chart').addClass('loading');
        $.ajax({
            url: '/cgi-bin/dbbindings.py',
            data: {
                method: 'return_query_values',
                queryTerms: JSON.stringify(query)
            },
            dataType: 'html',
            success: function(response) {
                var res = response.split('===RESULT===')[1];
                //        console.log('query response:')
                //        console.log( eval(res));
                // save data to page
                data = eval(res);
                // get word and book counts
                // We don't seem to do this anymore, so I'm commenting it out.
                $.ajax({
                    context: '#settings',
                    url: '/cgi-bin/dbbindings.py',
                    data: {
                        method: 'return_slug_data',
                        queryTerms: JSON.stringify(query)
                    },
                    dataType: 'html',
                    success: function(response) {
                        var actual_string = response.split('===RESULT===')[1];
                        cts = eval(actual_string);
                        renderChart();
                    }
                });
            }
        });
    }
    minTime = function() {
        return getDate($('#year-slider').slider('values', 0)).getTime();
    }
    maxTime = function() {
        return getDate($('#year-slider').slider('values', 1)).getTime();
    }
    numToReadText = function(n) {
        var v;
        if (n < 1000) return n;
        if (n < 1000000) {
            v = n / 1000.0;
            return "" + (Math.floor(v)) + "K";
        }
        if (n < 1000000 * 1000) {
            v = n / 1000000.0;
            return "" + (Math.floor(v)) + "M";
        }
        if (n < 1000000 * 1000 * 1000) {
            v = n / (1000000 * 1000.0);
            return "" + (Math.floor(v)) + "B";
        }
        if (n < 1000000 * 1000 * 1000 * 1000) {
            v = n / (1000000 * 1000 * 1000.0);
            return "" + (v.toFixed(1)) + "tr";
        }
    };
    renderChart = function() {
        // get categories for legend
        var q = $('a.box_data');
        q = q.slice(0, q.length - 1);
        q = _.map(q, function(el, i) {
            var s = $(el).html();
            //var pw = '; '+numToReadText(cts[i][0]) + ' ' + options['settings']['itemName'] + 's, '+numToReadText(cts[i][1])+ ' words';
            pw = '';
            var aa = [];
            if (s == 'All ' + options['settings']['itemName'] + 's') {
                aa.push('all ' + options['settings']['itemName'] + 's');
            } else {
                var a = s.split('|');
                //        console.log(a[0]);
                _(a).each(function(ss) {
                    aa.push($.trim(ss));
                });
            }
            return '[' + aa.join(', ') + pw + ']';
        });
        //    console.log('grabbing cats');
        //    console.log(q);
        //extract series from DB returns
        var series = [];
        var myt = $('#time_measure').val();
        if (time_array.length == 1) {
            myt = time_array[0]['dbfield'];
        }
        var xtype = "datetime";
        if (myt == "author_age") {
            xtype = "linear";
        }
        var year_span = _.range($('#year-slider').slider('values', 0), $('#year-slider').slider('values', 1));
        _(data).each(function(s, i) {
            var vals = s['values'];
            var sdata = [];
            var years = _.filter(year_span, function(year) {
                return vals.hasOwnProperty(year);
            });
            _.each(years, function(year) {
                var datestr;
                if (myt == "date_month" || myt == "month") {
                    var date = getDate(year);
                    var date_parts = date.toDateString().substring(4).split(' ');
                    var date_str_clean = date_parts[0] + ' ' + date_parts[2];
                    var opts = {
                        n: i,
                        t: year,
                        str: date_str_clean
                    };
                    sdata.push({
                        x: date.getTime(),
                        y: parseFloat(vals[year]),
                        opts: opts
                    });
                } else if (myt == "date_year" || myt == "year") {
                    var opts = {
                        n: i,
                        t: year,
                        str: year
                    };
                    sdata.push({
                        x: Date.UTC(year, 0, 1),
                        y: parseFloat(vals[year]),
                        opts: opts
                    });
                } else {
                    var opts = {
                        n: i,
                        t: year,
                        str: year
                    };
                    sdata.push({
                        x: Date.UTC(year, 0, 1),
                        y: parseFloat(vals[year]),
                        opts: opts
                    });
                }
            });
            var serie = {
                name: s['Name'],
                data: sdata,
                color: hexColors[i + 1],
            }
            series.push(serie);
        });

        // chart options
        var xAxisLabel = year_option['name']
        var yAxisLabel = $('.active', '#collationtype').data('label');

        // render chart
        var chart = new Highcharts.Chart({
            chart: {
                //renderTo: 'chart',
                renderTo: 'chart',
                reflow: false,
                spacingTop: 20,
                zoomType: 'x',
                type: 'line'
            },
            title: {
                text: null
            },
            exporting: {
                width: 800,
                buttons: {
                    printButton: {
                        enabled: false
                    }
                }
            },
            lineWidth: 1,
            xAxis: {
                type: xtype,
                //    maxZoom: 60*24*3600*1000,
                title: {
                    text: xAxisLabel,
                    style: {
                        color: "#000000",
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                },
                lineWidth: 1,
                lineColor: '#555555',
                //tickColor: '#555555',
                //tickPosition: 'inside',
                gridLineWidth: 0,
                //gridLineColor: '#DADADA',
                labels: {
                    style: {
                        fontSize: 12
                    }
                }
            },
            yAxis: {
                title: {
                    text: yAxisLabel,
                    style: {
                        color: "#000000",
                        fontWeight: 'normal',
                        fontSize: 14
                    }
                },
                lineWidth: 1,
                lineColor: '#555555',
                tickColor: '#555555',
                labels: {
                    style: {
                        fontSize: 12
                    },
                    formatter: function() {
                        if (yAxisLabel.indexOf('%') != -1) return this.value + '%';
                        else return this.value
                    }
                },
                gridLineWidth: 0,
                //gridLineColor: '#DADADA',
                min: 0
            },
            legend: {
                layout: 'vertical',
                align: 'left',
                floating: true,
                borderWidth: 0,
                y: 0,
                x: 100,
                symbolPadding: -2,
                symbolWidth: 0,
                verticalAlign: 'top',
                labelFormatter: function() {
                    return '<span style="color: ' + this.color + ';">' + this.name + ' ' + q[this.index] + '</span>';
                },
                itemStyle: {
                    fontSize: '110%',
                    fontWeight: 'bold'
                }
            },
            series: series,
            plotOptions: {
                line: {
                    animation: true,
                    shadow: false
                    //stickyTracking: false
                },
                series: {
                    marker: {
                        enabled: false,
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    },
                    states: {
                        hover: {
                            lineWidth: 5
                        }
                    },
                    cursor: 'pointer',
                    events: {
                        click: showBooks
                    }
                }
            },
            point: {},
            tooltip: {
                formatter: function() {
                    var point = this.point;
                    return '<span class="tooltip_top">' + point.series.name + "</span><br />" + point.opts.str + " <br />Freq: " + point.y + '<br /><span style="font-style:italic;">Click for ' + options['settings']['itemName'] + "s</span>";
                }
            }
        });
    }

    // run query on enter key
    $('#search_queries').on('keydown', 'input.term', function(event) {
        if (event.keyCode == 13) runQuery();
    });

    showBooks = function(event) {
        //    console.log(event.point);
        var name = this.name;
        var title = "Top search results for <code>" + name + "</code> in <code>" + event.point.opts.str + "</code>";
        $('.books-title').html(title);
        query = buildQuery();
        query['search_limits'] = [query['search_limits'][event.point.opts['n']]];
        query['search_limits'][0][query['time_measure']] = [event.point.opts['t']];
        return $.ajax({
            url: '/cgi-bin/dbbindings.py',
            type: 'post',
            data: {
                method: 'return_books',
                queryTerms: JSON.stringify(query)
            },
            success: function(response) {
                var cat_link, dataArray, i, linkData, read_link, row, _k, _len3, _ref;
                //        console.log("Successfully Posted");
                response = response.split('===RESULT===')[1];
                dataArray = eval(eval(response)[0]);
                bookLinks = [];
                for (_k = 0, _len3 = dataArray.length; _k < _len3; _k++) {
                    //linkData = dataArray[_k];
                    //  read_link = "<a class=booklink href='" + linkData['read_url'] + "' target='_blank'>Read</a>";
                    //  row = "<tr><td><span class=book-title>" + linkData['title'] + "</span><span class=bookauthor> by " + linkData['author'] + "</span> " + read_link + "</tr>";
                    bookLinks.push("<tr><td>" + dataArray[_k] + "</tr></td>");
                }
                //    console.log(bookLinks);
                $('.book-list').html('<table></table>');
                for (i = 0, _ref = Math.min(10, dataArray.length); 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
                    $('.book-list table').append(bookLinks[i]);
                }
                $('#books').modal('show');
                n_pages = Math.ceil(bookLinks.length / 10.0);
                page = 1;
                $('.pagination ul').html('');
                $('.pagination ul').append('<li><a href="#">«</a></li>');
                for (i = 1; i <= n_pages; i++)
                $('.pagination ul').append('<li><a href="#">' + i + '</a></li>');
                $('.pagination ul').append('<li><a href="#">»</a></li>');
                $('.active', '#books').removeClass('active');
                $('.disabled', '#books').removeClass('disabled');
                $('a:contains(«)', '#books').parent('li').addClass('disabled');
                $('.pagination a', '#books').filter(function(i, v) {
                    //          console.log(i+ " " +page);
                    return i == page;
                }).parent('li').addClass('active');
            }
        });
    }
    var page = 0;
    var n_pages = 0;
    $('#books').on('click', '.pagination a', function(event) {
        var v = $(this).html();
        if (v == '«') {
            if (page <= 1) return false;
            page--;
        } else if (v == '»') {
            if (page >= n_pages) return false;
            page++;
        } else {
            page = parseInt(v);
        }
        $('.book-list').html('<table></table>');
        for (i = (page - 1) * 10; i < Math.min(page * 10, bookLinks.length); i++) {
            $('.book-list table').append(bookLinks[i]);
        }
        $('.active', '#books').removeClass('active');
        $('.disabled', '#books').removeClass('disabled');
        if (page == 1) $('a:contains(«)', '#books').parent('li').addClass('disabled');
        if (page == n_pages) $('a:contains(»)', '#books').parent('li').addClass('disabled');
        $('.pagination a', '#books').filter(function(i, v) {
            return i == page;
        }).parent('li').addClass('active');
    });
    $('#books').on('click', '.close', function(event) {
        $('#books').modal('hide');
    });
    // permalink
    permQuery = function() {
        //    console.log('permquery');
        var query = buildQuery();
        var def = options['default_search'][0];
        var limits = {};
        // only store attributes different from the first default query
        _(def).each(function(v, key) {
            var eq = _.isEqual(def[key], query[key]);
            if (!eq) {
                limits[key] = query[key];
            }
        });
        var hash = $.URLEncode(JSON.stringify(limits));
        //    console.log('hash');
        var link = document.location.href.split('#')[0] + "#?" + hash;
        //    console.log(link);
        return link;
    }
    // permalink dropdown css and toggling
    $('.permalink').click(function(event) {
        inSettings = function(evt) {
            if ($(evt.target).parents('#permalink').length == 0) hidePermalink();
        }
        hidePermalink = function() {
            $('.permalink-img').css('background-color', '#ffffff');
            $('#permalink').hide();
            $(document).off('click', 'body', inSettings);
        }
        if ($('#permalink').is(':visible')) {
            hidePermalink();
        } else {
            hidePopups();
            $('#permalink').css('top', $('.permalink').height() + $('.permalink').position().top);
            $('#permalink').css('left', $('.permalink').width() + $('.permalink').position().left - $('#permalink').width() - 11);
            $('.permalink-img').css('background-color', '#abcdef');
            $('#permalink').show();
            $('#permalink input').focus().select();
            $(document).on('click', 'body', inSettings);
        }
        return false;
    });
    // category box updating
    fixSlugs = function() {
        var query = buildQuery();
        //    console.log(query);
        var opts = options['ui_components'];
        // extract from search-limits
        var limits = query['search_limits'];
        _($('.category_box')).each(function(v, i) {
            //console.log(v);
            var limit = limits[i];
            var slugs = [];
            _(opts).each(function(opt) {
                if (opt['type'] == 'categorical' && limit[opt['dbfield']]) {
                    var lim = limit[opt['dbfield']];
                    var _j, sname;
                    var elts = _(opt['categorical']['sort_order']).map(function(key) {
                        return opt['categorical']['descriptions'][key];
                    });
                    sname = [];
                    var _i = 0;
                    var _k = 0;
                    for (_j = 0; _j < elts.length; _j++) {
                        for (_k = 0; _k < lim.length; _k++) {
                            if (elts[_j]['dbcode'] == lim[_k]) {
                                if (typeof elts[_j]['shortname'] == 'undefined') {
                                    sname[_i++] = elts[_j]['name'];
                                } else {
                                    sname[_i++] = elts[_j]['shortname'];
                                }
                            }
                        }
                    }
                    var slug = opt['name'] + ': ' + sname.join(', ');
                    //var slug = sname.join(', ');
                    slugs.push(slug);
                }
            });
            var meta_text = (slugs.length != 0) ? slugs.join(' | ') : "All " + options['settings']['itemName'] + "s";
            $(v).find('.box_data').html(meta_text);
        });
    }
    $(document).on('change', '.edit-box select', function(event) {
        fixSlugs();
    });
    // popup divs
    popups = ['#settings', '#permalink', '#about'];
    popup_imgs = ['.permalink-img', '.advanced-img', '.about-img'];
    hidePopups = function() {
        _(popups).each(function(v) {
            $(v).hide();
        });
        _(popup_imgs).each(function(v) {
            $(v).css('background-color', "#ffffff");
        });
        $(document).off('click', 'body');
    }
    key('esc', hidePopups);
    key('enter', runQuery);
    $('#books').modal({
        backdrop: false,
    });
    $('#books').modal('hide');
    $('#search_queries').on('click', '.search-btn', function(event) {
        runQuery();
    });
    validateQuery = function() {
        //    console.log('validate');
        var error = '';
        // check length of each term box
        var lengthArray = $('.term').filter(function(i, v) {
            return $(v).val().split(' ').length > 2;
        });
        if (lengthArray.length > 0) error = "Sorry, this Bookworm is only configured to support one and two-word phrases.";
        $('#search_error').html(error);
        if (error != '') return false;
        return true;
    }
});
