(function() {

  $(document).ready(function() {
    var addCommas, addRow, buildQuery, colors, cts, data, firstQuery, fixColors,
     fixEditBoxPositions, fixSlugs, fixTime, fixXButton, getDate, getHash, 
     getSmoothing, hexColors, initializeSelectBoxes, lazyround,
     maxTime, metadata, minTime, n_pages, newEditBox, newSliders, numToReadText, 
    options, page, permQuery, renderChart, rows, runQuery, search_button, 
    showBooks, time_array, toggler, validateQuery, year_option,bookLinks;
    rows = 0;
    data = [];
    cts = [];
    metadata = [];
    // Set default options. These are extended by the options from options.json, only overwriting when there's a new setting.
    options = {
        settings: {
            host: "/cgi-bin/dbbindings.py"
        }
    };
    colors = ["", "128, 177, 211", "251, 128, 114", "179, 222, 105", "141, 211, 199", "190, 186, 218", "252, 205, 229", "217, 217, 217"];
    hexColors = ["", "#1F77B4", "#FF7F0E", "#2CA02C", "#D62728", "#9467BD", "#8C564B", "#E377C2", "#7F7F7F", "#BCBD22", "#17BECF"];
    time_array = [];
    year_option = void 0;

    $.ajax({
      url: "static/options.json",
      dataType: "json",
      success: function(response) {
        options = $.extend(true, options, response);
        firstQuery();
        runQuery();
      },
      error:function(exception){console.log('Exception:'+exception);}
    });

    getHash = function() {

      var translateOldCounttypes = function(term) {
	  //some back-compatability for old versions of this browser.
	  var translations = {
	      "Occurrences_per_Million_Words":"WordsPerMillion",
	      "Number_of_Words":"WordCount",
	      "Percentage_of_Texts":"TextPercent",
	      "Number_of_Books":"TextCount"
	  }
	  if (typeof(translations[term])!="undefined") {return translations[term]}
	  return term
      }
      var def, link, ps;
      link = decodeURIComponent(document.location.hash);
      if (link) { 
        link = link.substr(link.indexOf("{"), link.lastIndexOf("}"));
        ps = JSON.parse(link);
        def = options["default_search"][0];
        _(def).each(function(v, key) {
          if (!ps[key]) {
            ps[key] = def[key];
          }
        });
      } else {
	ps = options["default_search"][Math.floor(Math.random() * options["default_search"].length)];
      }
        ps['counttype'] = translateOldCounttypes(ps['counttype'])
        return ps;
    };

	// Interactivity for metric/case selection dropdowns
	$(".collationtype li").on("click", function(event) {
		$(".collationtype li").removeClass("active");
		$(this).addClass("active");
	})
	$(".counttype li").on("click", function(event) {
		$(".counttype li").removeClass("active");
		$(this).addClass("active");
	})


    firstQuery = function() {
      var params, search_limits;
      $("#sourceName1").html(options["settings"]["sourceName"]);
      document.title = "bookworm " + options["settings"]["sourceName"];
      $(".bw-texttype").text(options.settings.itemName + "s");
      $("#sourceURL").html("<a href=\"" + options["settings"]["sourceURL"] + "\">" + options["settings"]["sourceURL"] + "</a>");
      if (options.settings.magnitude) {
          $('.bw-magnitude').text(options.settings.magnitude);
      }
      params = getHash();
      search_limits = params["search_limits"];
      _.each(search_limits, function(el) {
        addRow();
      });
      $("input.term").each(function(i, v) {
        $(v).val(search_limits[i]["word"][0].split("+").join(" "));
      });
      initializeSelectBoxes();
      newSliders();
      $(".collationtype li").filter(function(i, v) {
        return $(v).data("val") === params["words_collation"];
      }).addClass("active");
      $(".counttype li").filter(function(i, v) {
        return $(v).data("val") === params["counttype"];
      }).addClass("active");
      if ("time_limits" in params) {
      	$("#year-slider").data('slider').setValue(params["time_limits"]);
      }
      fixTime();
      params["timeUnit"] = year_option;
      if ("smoothingSpan" in params) {
      	 $("#smoothing-slider").data('slider').setValue(params["smoothingSpan"]);
      }
      $("#smoothing-val").text(getSmoothing(params["smoothingSpan"]) + " " + params["timeUnit"]["unit"] + "s");
      $(".edit-box").each(function(i, v) {
        $(v).find(".datarow").each(function(r, row) {
          var key;
          key = $(row).data("name");
          _(search_limits[i][key]).each(function(k) {
            $("option[value=\"" + k + "\"]", row).attr("selected", "selected");
          });
          $(row).find("select").trigger("liszt:updated");
        });
      });
      fixSlugs();
    };


    $("#search_queries").on("click", ".box_plus", function(event) {
      var row = $(this).parents(".search-row").data("row");
      addRow(true, row);
      updateDeleteButton();
    });


    addRow = function(copy, row) {
      var last_cat, last_cats, newCatBox, newRow, new_cat, prevterm, rowHTML, searchRow;
      rows++;
      prevterm = $("#search_queries input.term").last().val();
      if (row) {
        searchRow = _.find($(".search-row"), function(v) {
          return $(v).data("row") === row;
        });
        prevterm = $("input.term", searchRow).val();
      }
      rowHTML = "<p class=search-row data-row=" + rows + ">";
      rowHTML += "<a href=\"#\" class=\"box_x\"><span class=\"removequery\"><span class=\"glyphicon glyphicon-minus\" aria-hidden=\"true\"></span></span></a>";
      rowHTML += '<a class="box_plus" href="#" alt="Add"><span class="addquery"><span class="glyphicon glyphicon-plus" aria-hidden="true"></span></span></a>';
      rowHTML += "<input placeholder='Search terms' class=term></input>";
      rowHTML += " in ";
      rowHTML += "<span class=filter-list></span>";
      rowHTML += "</p>";
      if (!row) {
        $("#search_queries").append(rowHTML);
      } else {
        $(searchRow).after(rowHTML);
      }
      updateDeleteButton();
      if (row) {
        newRow = _.find($(".search-row"), function(v) {
          return $(v).data("row") === rows;
        });
        newCatBox = $(newRow).find(".filter-list");
      }
      if (!row) {
        $("#category_box_template").clone().removeClass("category_box_template").addClass("category_box").attr("id", "cat_box_" + rows).appendTo("#search_queries .search-row:last .filter-list");
      } else {
        $(newCatBox).append($("#category_box_template").clone().removeClass("category_box_template").addClass("category_box").attr("id", "cat_box_" + rows));
      }
      $("#cat_box_" + rows + " .box_data").text("All " + options["settings"]["itemName"] + "s");
      last_cat = _.last($(".edit-box"));
      if (row) {
        last_cat = _.find($(".edit-box"), function(v) {
          return $(v).data("row") === row;
        });
      }
      last_cats = {};
      $(last_cat).find(".datarow").each(function(i2, v2) {
        var singlecats;
        singlecats = [];
        $(v2).find("option:selected").each(function(i3, v3) {
          singlecats.push($(v3).val());
        });
        last_cats[$(v2).data("name")] = singlecats;
      });
      newEditBox(rows);

      if (copy) {
        $("input.term", newRow).val(prevterm);
        $(".edit-box").last().find("select")
			.each(function(i2, v2) {
			  var name;
			  name = $(v2).parents(".datarow").data("name");
			  _.each(last_cats[name], function(elv) {
				$("option[value='" + elv + "']", v2).attr("selected", "selected");
			  });
			  $(v2).trigger("liszt:updated");
			})
      }
      // Initialize Select2 for nicer select boxes. This is not done at newEditBox, because copied
      // rows may have options changed
      $(".edit-box").last().find("select").trigger("select2:change");
      
      $("#search_queries").on("click", "#cat_box_" + rows + " a.box_data", function(event) {
        var editId, editOpen, hideEdit, inEdit;
        fixEditBoxPositions();
        row = $(this).parents(".search-row").data("row");
        $(_.filter($(".edit-box"), function(el) {
          return $(el).data("row") !== row;
        })).each(function(i, v) {
          $(v).hide();
        });
        editId = ".edit_box_" + row;
        editOpen = $(editId).is(":visible");
        inEdit = function(evt) {
          if ($(evt.target).parents(editId).length === 0) {
            hideEdit();
          }
        };
        hideEdit = function() {
          $(".edit_box_" + row).hide();
          $(document).off("click", "body", inEdit);
        };
        if (!editOpen) {
          $(".edit_box_" + row).show();
          $(document).on("click", "body", inEdit);
        } else {
          hideEdit();
        }
        return false;
      });
      fixSlugs();
    };


    newEditBox = function(num) {
    	divName = "edit_box_" + num;
    	divHTML = $("<form class='form-horizontal dropdown-padding'></form>").addClass("edit-box").addClass(divName).data("row", num);
		  datatypes = ["categorical"];
		  opts = _.filter(options["ui_components"], function(v) {
			return _.includes(datatypes, v["type"]);
		  });
		  _.each(opts, function(opt) {
			var elts, row, rowHTML, select, selectHTML;
			row = $(row).append($("<td></td>").html(opt["name"]).addClass("edit-box-label"));
			if (opt["type"] === "categorical") {
			  elts = _(opt["categorical"]["sort_order"]).map(function(key) {
				return opt["categorical"]["descriptions"][key];
			  });
			  selectHTML = "<select data-placeholder='All texts' multiple=multiple style='width:350px;'>";
			  selectHTML += "<% _(elts).each(function(el){ %> <option value='<%= el['dbcode']%>'><%= el['name']%></option><% }); %>";
			  selectHTML += "</select>";
			  selectTemplate = _.template(selectHTML);
			  select = selectTemplate({ elts: elts });
			}

			rowHTML = "<div class=\"form-group\"><label for='x' class=\"col-sm-4 edit-box-label\"><%= label%></label>"
    		rowHTML += "<div class=\"datarow edit-box-select col-sm-8\" data-name=\"<%= dbcode %>\" ><%= select %></div></div>";
			rowTemplate = _.template(rowHTML);
			row = rowTemplate({ label: opt.name, select: select, dbcode: opt.dbfield });
			divHTML.append(row);
			$(divHTML).find("select").select2({ width: '100%' })
		  });
		  $("#cat_box_"+num+" .dropdown ul").append(divHTML);
    };

    $("#search_queries").on("click", ".add-query", function(event) {
      addRow(true);
    });

    fixXButton = function() {};
    toggler = function(link, target) {
      $(link).click(function(event) {
        var hideTarget, inTarget;
        inTarget = function(evt) {
          if ($(evt.target).parents(target).length === 0) {
            hideTarget();
          }
        };
        hideTarget = function() {};
      });
    };


    newSliders = function() {
      var newvalue, prevvalue, _j;
      _j = void 0;
      if (time_array.length > 0) {
        year_option = time_array[0];
        _j = 0;
        while (_j < time_array.length) {
          if (time_array[_j]["dbfield"] === $("#time_measure").val()) {
            year_option = time_array[_j];
          }
          _j++;
        }
      } else {
        year_option = _(options["ui_components"]).filter(function(v) {
          return v["type"] === "time";
        })[0];
      }
      $("#year-slider").slider({
        range: true,
        min: year_option["range"][0],
        max: year_option["range"][1],
        value: year_option["initial"]
      }).on("slide", fixTime);
      try {
      	prevvalue = $("#smoothing-slider").data('slider').getValue();
      } catch (e) {
      	console.warn("Trying to access smoothing before initialition.");
      }
      newvalue = 0;
      if (prevvalue != null) {
        newvalue = prevvalue;
      }
      $("#smoothing-slider").slider({
        min: 0,
        max: 14,
        value: newvalue,
        formatter: getSmoothing
      }).on("slide", function(event) {
          $("#smoothing-val").text("" + getSmoothing(event.value) + " " + year_option["unit"] + "s");
        }
      );
      $("#smoothing-slider").css("width", "240px");
    };
    initializeSelectBoxes = function() {
      var option, option_array, _j, _len2;
      option_array = options["ui_components"];
      $(".group_select_div").append("<select class=group_select> </select>");
      $(".limit_select_div").append("<select class=group_select> </select>");
      _j = 0;
      _len2 = option_array.length;
      while (_j < _len2) {
        option = option_array[_j];
        if (option["type"] === "time") {
          time_array.push(option);
        }
        _j++;
      }
      if (time_array.length > 1) {
        $("#labeltime").append("<label for=yeartype>Time:</label>");
        $("#timetype").append("<select id=time_measure onChange=newSliders()>");
        _j = 0;
        _len2 = time_array.length;
        while (_j < _len2) {
          option = time_array[_j];
          $("#time_measure").append("<option value='" + option["dbfield"] + "'>" + option["name"] + "</option>");
          _j++;
        }
        $("#yeartype").append("</select>");
      }
    };
    fixTime = function() {
      var dateparts1, dateparts2, datestr1, datestr2, t, v;
      v = $("#year-slider").data('slider').getValue();
      t = $("#time_measure").val();
      if (t === "date_month") {
        dateparts1 = getDate(v[0]).toDateString().substring(4).split(" ");
        dateparts2 = getDate(v[1]).toDateString().substring(4).split(" ");
        datestr1 = dateparts1[0] + " " + dateparts1[2];
        datestr2 = dateparts2[0] + " " + dateparts2[2];
        $("#time-val").text("" + datestr1 + " - " + datestr2);
      } else {
        $("#time-val").text("" + v[0] + " - " + v[1]);
      }
    };

    // delete a row
    $('#search_queries').on('click', '.box_x', function(event){
    	var num_el_rows = $('.search-row').length;
        if(num_el_rows > 1){
        	var row = $(this).parents('.search-row').data('row');
        	// remove corresponding edit box
            $('.edit_box_' + row).remove();
            $(this).parents('.search-row').remove();
        }
    	updateDeleteButton();
    });

    var updateDeleteButton = function() {
		if ($('.search-row').length == 1) {
			$('span.removequery').hide();
		} else {
			$('span.removequery').show();
		}
    }

    
    getDate = function(intval) {
      var minDate;
      minDate = new Date();
      minDate.setUTCFullYear(0);
      minDate.setUTCMonth(0);
      minDate.setUTCDate(1);
      minDate.setUTCSeconds(0);
      minDate.setUTCMilliseconds(0);
      minDate.setDate(minDate.getDate() + intval);
      return minDate;
    };


    getSmoothing = function(intval) {
      if (intval <= 10) {
        return intval;
      } else if (intval === 11) {
        return 12;
      } else if (intval === 12) {
        return 18;
      } else if (intval === 13) {
        return 24;
      } else {
        return 36;
      }
    };


    fixColors = function() {
      $(".category_box").each(function(i, v) {
        return $(this).find("td").css("background-color", "rgba(" + colors[i + 1] + ",1)");
      });
    };
    $(document).on("click", "#blah", function(event) {
      runQuery();
    });
    buildQuery = function() {
      var cat, cats, i, key, limit, limits, query, terms, time_measure,time_limits;
      time_measure = void 0;
      if (time_array.length === 1) {
        time_measure = time_array[0]["dbfield"];
      } else {
        if (time_array.length > 1) {
          time_measure = time_array[0]["dbfield"];
//        Here we need to restore the ability for multiple year fields. The 
//        selector is gone.          
//        Old code:
//
//        time_measure = $("#time_measure").val();
        }
      }
      query = {
        groups: [time_measure],
        counttype: $(".counttype li.active").data("val"),
        words_collation: $(".collationtype li.active").data("val"),
        database: options["settings"]["dbname"]
      };
      limits = [];
      terms = [];
      $("input.term").each(function(i, v) {
        terms.push($(v).val());
      });
      cats = [];
      $(".search-row").each(function(i, v) {
        var edit_box, row, subcats;
        row = $(v).data("row");

        edit_box = _.find($(".edit-box"), function(el) {
          return $(el).data("row") === row;
        });
        subcats = {};
        $(edit_box).find(".datarow").each(function(i2, v2) {
          var singlecats;
          singlecats = [];
          $(v2).find("option:selected").each(function(i3, v3) {
            singlecats.push($(v3).val());
          });
          subcats[$(v2).data("name")] = singlecats;
        });
        cats.push(subcats);
      });
      i = 0;
      while (i < terms.length) {
        limit = {
          word: [terms[i]]	    
        };
       try {
		time_limits = $("#year-slider").data('slider').getValue();
	   } catch (e) {
		console.warn("Trying to access slider before initialization.");
		time_limits = [0, 2016];
	   }
	limit[time_measure] = {"$gte":time_limits[0],"$lte":time_limits[1]}
        cat = cats[i];
        for (key in cat) {
          if (cat[key].length !== 0) {
            limit[key] = cat[key];
          }
        }
        limits.push(limit);
        i++;
      }
      query["search_limits"] = limits;
      query["method"] = "data";
      query["format"] = "json";
      return query;
    };
    addCommas = function(str) {
      var amount, i, output;
      amount = new String(str);
      amount = amount.split("").reverse();
      output = "";
      i = 0;
      while (i <= amount.length - 1) {
        output = amount[i] + output;
        if ((i + 1) % 3 === 0 && (amount.length - 1) !== i) {
          output = "," + output;
        }
        i++;
      }
      return output;
    };
    lazyround = function(num) {
      var newnum, parts;
      newnum = addCommas(num);
      parts = newnum.split(",");
      if (parts.length > 1) {
        return Math.round(parseInt(parts.join(""), 10) / Math.pow(1000, parts.length - 1)) + ["K", "M", "B"][parts.length - 2];
      } else {
        return parts[0];
      }
    };
    runQuery = function() {
      var query;
      if (!validateQuery()) {
        return false;
      }
      query = buildQuery();
      $("#permalink").find("input").val(permQuery());
      
      try{
      	updateTwitterValues(permQuery(),"Check out this #bookworm! ");
      }
      catch(err){
      	console.log(err.message);
      }
      $("#bw-search_error, #bw-search_warning").text("").hide();
      $("#chart").html("");
      $("#chart").addClass("loading");
      $.ajax({
        url: options.settings.host,
        data: {
          query: JSON.stringify(query)
        },
        dataType: "json",
        error: function(err) {
        	try {
				json = JSON.parse(err.responseText);
				msg = json['message'];
        	} catch (e) {
				msg = "Unknown backend error occurred. Sorry!";
        	}
        	$("#bw-search_error").text(msg).show();
        	console.log(err);	
        },
        success: function(response) {
		  newSliders();
		  var slugQuery;
		  termData = response['data'];
		  // Copy Query
		  slugQuery = JSON.parse(JSON.stringify(query));
		  slugQuery['groups'] = []
		  _.forEach(slugQuery['search_limits'],function(limit) {
			  delete limit['word'];
		  })
		  slugQuery['counttype'] = ['TextCount','WordCount'];
		  $.ajax({
			    context: "#search_queries",
				url: options.settings.host,
				data: {
				  query: JSON.stringify(slugQuery)
				},
				dataType: "json",
				success: function(response) {
					catData = response['data'];
					renderChart(termData, catData);
				}
		  });
        }
      });
    };
    minTime = function() {
      return getDate($("#year-slider").data('slider').getValue()[0]).getTime();
    };
    maxTime = function() {
      return getDate($("#year-slider").data('slider').getValue()[1]).getTime();
    };
    numToReadText = function(n) {
      var v;
      v = void 0;
      if (n < 1000) {
        return n;
      }
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

    renderChart = function(termData, catData) {
      var chart, myt, q, series, xAxisLabel, xtype, yAxisLabel, year_span, filter_str;
      var query = buildQuery();

      if (!(termData instanceof Array)) {
      	termData = [termData];
      };
      if (!(catData[0] instanceof Array)) {
      	catData = [catData];
      }
      q = $(".box_data");
      q = q.slice(0, q.length - 1);
      q = _.map(q, function(el, i) {
        var a, aa, pw, s;
        filter_str = $(el).html();
        pw = "; " + numToReadText(catData[i][0]) + " " + 
	      options["settings"]["itemName"] + "s, " + 
	      numToReadText(catData[i][1]) + 
	      " words";
        if (filter_str !== "All " + options.settings.itemName + "s") {
          filter_str = filter_str.replace(/<.?span.*?>/g, '_');
        }
        return "[" + filter_str + "]" + pw;
      });
      series = [];
      myt = time_array[0]["dbfield"];
      xtype = "datetime";
      if (myt === "author_age") {
        xtype = "linear";
      }
      year_span = _.range($("#year-slider").data('slider').getValue()[0], 
                          $("#year-slider").data('slider').getValue()[1] + 1)
      _(termData).each(function(s, i) {
        var sdata, serie, vals, years,groupName,smoothingSpan;
	  vals = {}
	  _.keys(s).forEach(function(key) {
	      vals[String(parseInt(key))] = s[key]
	  })

	
	var smoothingSpan = getSmoothing($("#smoothing-slider").data('slider').getValue())
	if (smoothingSpan>0) {
	    vals = smooth(vals,smoothingSpan)
	}
	  
        sdata = [];
	if (typeof(query) != "undefined") {
	  groupName = query.search_limits[i].word.join(", ")
	}

        years = _.filter(year_span, function(year) {
          return vals.hasOwnProperty(year)
        });
        _.each(years, function(year) {
          var date, date_parts, date_str_clean, datestr, opts;
          datestr = void 0;
          if (/(month|day|week)(_.*)?$/.test(myt)) {
            date = getDate(year);
            date_parts = date.toDateString().substring(4).split(" ");
            date_str_clean = date_parts[0] + " " + date_parts[2];
            opts = {
              n: i,
              t: year,
              str: date_str_clean
            };
            sdata.push({
              x: date.getTime(),
              y: parseFloat(vals[year]),
              opts: opts
            });
          } else if (/year(_.*)?$/.test(myt)) {
            opts = {
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
            opts = {
              n: i,
              t: year,
              str: year
            };
	    d = new Date()
	    d.setUTCFullYear(year)
            sdata.push({
              x: d,
              y: parseFloat(vals[year]),
              opts: opts
            });
          }
        });
        serie = {
          name: groupName,
          data: sdata,
          color: hexColors[i + 1]
        };
        series.push(serie);
      });
      xAxisLabel = year_option["name"];
      yAxisLabel = $(".active", ".counttype").data("label");
      chart = new Highcharts.Chart({
        chart: {
          renderTo: "chart",
          reflow: true,
          spacingTop: 10,
          spacingBottom: 10,
          zoomType: "x",
          type: "line",
          resetZoomButton: {
                position: {
                        align: 'center',
                        y: -60
                }
          }
        },
        exporting: {
        	// This still allows for API calles, it just removes the 
        	// button on the chart
        	enabled: false	
        },
        title: {
          text: null
        },
        lineWidth: 1,
        xAxis: {
          type: xtype,
          title: {
            text: xAxisLabel,
            style: {
              color: "#000000",
              fontWeight: "normal",
              fontSize: 14
            }
          },
          lineWidth: 1,
          lineColor: "#555555",
          gridLineWidth: 0,
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
              fontWeight: "normal",
              fontSize: 14
            }
          },
          lineWidth: 1,
          lineColor: "#555555",
          tickColor: "#555555",
          labels: {
            style: {
              fontSize: 12
            },
            formatter: function() {
              if (yAxisLabel.indexOf("%") !== -1) {
                return this.value + "%";
              } else {
                return this.value;
              }
            }
          },
          gridLineWidth: 0,
          min: 0
        },
        legend: {
          layout: "vertical",
          align: "left",
          floating: true,
          borderWidth: 0,
          y: 0,
          x: 100,
          symbolPadding: -2,
          symbolWidth: 0,
          verticalAlign: "top",
          labelFormatter: function() {
            return "<span style=\"color: " + this.color + ";\">" + this.name + " " + q[this.index] + "</span>";
          },
          itemStyle: {
            fontSize: "110%",
            fontWeight: "bold"
          }
        },
        series: series,
        plotOptions: {
          line: {
            animation: true,
            shadow: false
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
            cursor: "pointer",
            events: {
              click: showBooks
            }
          }
        },
        point: {},
        tooltip: {
          formatter: function() {
            var point;
            point = this.point;
            return "<span class=\"tooltip_top\">" + point.series.name + "</span><br />" + point.opts.str + " <br />Freq: " + point.y + "<br /><span style=\"font-style:italic;\">Click for " + options["settings"]["itemName"] + "s</span>";
          }
        }
      });

	/* Add export handlers for buttons in GUI */
    $('.bw-export-png').click(function () {
    	chart.exportChart({filename:"bookworm", type:"image/png"});
    });
    $('.bw-export-pdf').click(function () {
    	chart.exportChart({filename:"bookworm", type:"application/pdf"});
    });

    };

    $("#search_queries").on("keydown", "input.term", function(event) {
      if (event.keyCode === 13) {
        runQuery();
      }
    });
    showBooks = function(event) {
      var name, query, title;
      name = this.name;
      title = "Top search results for <code>" + name + "</code> in <code>" + event.point.opts.str + "</code>";
      $(".books-title").html(title);
      query = buildQuery();
      query["search_limits"] = [query["search_limits"][event.point.opts["n"]]];
      query["search_limits"][0][query["groups"]] = [event.point.opts["t"]];
      query["method"] = "return_books"
      return $.ajax({
        url: options.settings.host,
        type: "post",
        data: {
          query: JSON.stringify(query)
        },
        success: function(response) {
          var cat_link, dataArray, i, linkData, n_pages, page, read_link, row, _k, _len3, _ref;
          cat_link = void 0;
          dataArray = void 0;
          i = void 0;
          linkData = void 0;
          read_link = void 0;
          row = void 0;
          _k = void 0;
          _len3 = void 0;
          _ref = void 0;
          dataArray = JSON.parse(response.replace(/.*RESULT===/,""))

          bookLinks = [];
          _k = 0;
          _len3 = dataArray.length;
          while (_k < _len3) {
            bookLinks.push("<li>" + dataArray[_k] + "</li>");
            _k++;
          }
          $("ul.book-list").html("");
          i = 0;
          _ref = Math.min(10, dataArray.length);
          while ((0 <= _ref ? i < _ref : i > _ref)) {
            $("ul.book-list").append(bookLinks[i]);
            if (0 <= _ref) {
              i++;
            } else {
              i--;
            }
          }
          $("#books").modal("show");
          n_pages = Math.ceil(bookLinks.length / 10.0);
          page = 1;
          $("ul.pagination").html("").data("books-pages", n_pages);
          $("ul.pagination").append("<li><a href=\"#\">«</a></li>");
          i = 1;
          while (i <= n_pages) {
            $("ul.pagination").append("<li><a href=\"#\">" + i + "</a></li>");
            i++;
          }
          $("ul.pagination").append("<li><a href=\"#\">»</a></li>");
          $(".active", "#books").removeClass("active");
          $(".disabled", "#books").removeClass("disabled");
          $("a:contains(«)", "#books").parent("li").addClass("disabled");
          $("ul.pagination a", "#books").filter(function(i, v) {
            return i === page;
          }).parent("li").addClass("active");
        },
        error:function(exception){console.log('Exception:'+exception);}
      });
    };
    page = 1;
    $("#books").on("click", "ul.pagination a", function(event) {
      var i, v;
      var n_pages = $("ul.pagination").data("books-pages");
      v = $(this).html();
      if (v === "«") {
        if (page <= 1) {
          return false;
        }
        page--;
      } else if (v === "»") {
        if (page >= n_pages) {
          return false;
        }
        page++;
      } else {
        page = parseInt(v);
      }
      $("ul.book-list").html("");
      i = (page - 1) * 10;
      while (i < Math.min(page * 10, bookLinks.length)) {
        $("ul.book-list").append(bookLinks[i]);
        i++;
      }
      $(".active", "#books").removeClass("active");
      $(".disabled", "#books").removeClass("disabled");
      if (page === 1) {
        $("a:contains(«)", "#books").parent("li").addClass("disabled");
      }
      if (page === n_pages) {
        $("a:contains(»)", "#books").parent("li").addClass("disabled");
      }
      $(".pagination a", "#books").filter(function(i, v) {
        return i === page && $(v).text() !== "»";
      }).parent("li").addClass("active");
    });
    permQuery = function() {
      var def, hash, limits, link, query;
      query = buildQuery();
      def = _.sample(options["default_search"]);
      limits = {};
      _(def).each(function(v, key) {
        var eq;
        eq = _.isEqual(def[key], query[key]);
        if (!eq) {
          limits[key] = query[key];
        }
      });
      hash = encodeURI(JSON.stringify(limits));
      link = document.location.href.split("#")[0] + "#?" + hash;
      return link;
    };


    $(".permalink").click(function(e) {
    	e.preventDefault();
    	e.stopPropagation();
		$("#permalink input").focus().select();
      	return true;
    });


    fixSlugs = function() {
      var limits, opts, query;
      query = buildQuery();
      opts = options["ui_components"];
      limits = query["search_limits"];
      $(".category_box").each(function(i, search_limit_el) {
        var limit, meta_text, slugs;
        limit = limits[i];
        slugs = [];
        _.forEach(opts, function(opt) {
          var elts, lim, slug, sname, _i, _j, _k;
          if (opt.type === "categorical" && limit[opt.dbfield]) {
            lim = limit[opt.dbfield];
            _j = void 0;
            sname = void 0;
            elts = _.map(opt["categorical"]["sort_order"], function(key) {
              return opt["categorical"]["descriptions"][key];
            });
            sname = [];
			_.each(elts, function(elt, _j){
				if (_.includes(lim, elt.dbcode)){
					  if (typeof elt.shortname === "undefined") {
						sname.push(elt.name);
					  } else {
						sname.push(elt.shortname);
					  }
				}
			});
             

            slug = opt["name"] + ": " + sname.join(' <span class="query-cond text-muted">OR</span> ');
            slug_wrapped = "( "+slug+" )";
            slugs.push(slug_wrapped);
          }
        });
        meta_text = (slugs.length !== 0 ? slugs.join(' <span class="query-cond text-muted">AND</span> ') : "All " + options["settings"]["itemName"] + "s");
        $(search_limit_el).find(".box_data").html(meta_text);
      });
    };
    $(document).on("change", ".edit-box select", function(event) {
      fixSlugs();
    });

    key("enter", runQuery);
    $("#books").modal({
      backdrop: false
    });
    $("#books").modal("hide");
    $(".search-bw.search-btn").on("click", function(event) {
      runQuery();
    });
    validateQuery = function() {
      var error, lengthArray;
      error = "";
      lengthArray = $(".term").filter(function(i, v) {
        return $(v).val().split(" ").length > 3;
      });
      if (lengthArray.length > 0) {
        error = "Sorry, this Bookworm is only configured to support 1-word, 2-word, and 3-word phrases.";
      }
      $("#bw-search_error").html(error);
      if (error !== "") {
        return false;
      }
      return true;
    };
  function smooth(data,span,myt) {
    //This could be modified to take a kernel or something.
    var output,years,smoothingGroups;
    myt = myt || time_array[0]["dbfield"];
    output = {}
    smoothingGroups = {};
    years = _.keys(data);
    _.forEach(years,function(year) {
      multiplier =
        myt.match(/_week/) ? 7 :
        myt.match(/_month/) ? 30 :
        1

      //for each date, append it to the nearby years if they exist in the original.
      _.forEach(_.range(-span*multiplier,span*multiplier+1),function(offset) {
        comparator = String(parseInt(year)+offset)
        if (typeof(data[comparator]) !="undefined") {
          if (typeof(smoothingGroups[String(year)])=="undefined") {
            //Initialize if missing
            smoothingGroups[String(year)] = []
          }
          smoothingGroups[String(year)] = smoothingGroups[String(year)].concat(data[comparator])
        }
      })
    })
    var sum = function(arr) {
      return arr.reduce(function(a,b) {return a+b})
    }
    _.forEach(years,function(year) {
      output[year] = sum(smoothingGroups[year])/smoothingGroups[year].length
    })
    return output
  }
  });

}).call(this);
