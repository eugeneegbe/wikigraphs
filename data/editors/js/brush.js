var init_brush = function(options, callback){
	var brush_height = options['height'];
	var brush_width = options['width'];
	var brush_domain = options['domain'];
	var brush_extent = options['extent'];
	var brush_max_extent = options['extent'][1];
	var brush_ticks = options['ticks'];
	var brush_tick_size = options['tick_size'];
	var brush_extent_round = options['round'];
	var initially_fire_callback = true;
	var brush_scale =  d3.scale.linear()
	    .domain(brush_domain)
	    .range([0, brush_width]);

	var brush = d3.svg.brush()
	    .x(brush_scale)
	    .extent(brush_extent)
	    .on("brushend", brushended);

	var brush_container = d3.select("svg").append("g").attr("transform", "translate(12, 0)");
	brush_container.append("rect")
	    .attr("class", "grid-background")
	    .attr("width", brush_width)
	    .attr("height", brush_height);

	brush_container.append("g")
	    .attr("class", "x grid")
	    .attr("transform", "translate(0," + brush_height + ")")
	    .call(d3.svg.axis()
		.scale(brush_scale)
		.orient("bottom")
		.ticks(brush_ticks)
		.tickSize(-brush_height)
		.tickFormat(""))
	  .selectAll(".tick")

	brush_container.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + brush_height + ")")
		.call(d3.svg.axis()
		.scale(brush_scale)
		.orient("bottom")
		.ticks(brush_ticks)
		.tickSize(4,4)
		.tickPadding(0))
	  .selectAll("text")
	    .attr("x", -1)
	    .attr("y", 5)
	    .style("text-anchor", null);

	gBrush = brush_container.append("g")
	    .attr("class", "brush")
	    .call(brush)
	    .call(brush.event);

	gBrush.selectAll("rect")
	    .attr("height", brush_height);
	
	gBrush.selectAll(".resize").append("line")
	    .attr("y2", brush_height);
	
	gBrush.selectAll(".resize").append("path")
	.attr("d", d3.svg.symbol().type("triangle-up").size(30))
	.attr("transform", function(d,i) {  return i ? "translate(" + -5 + "," +  brush_height / 2 + ") rotate(-90)" : "translate(" + 5 + "," +  brush_height / 2 + ") rotate(90)"; });

	function brushended() {
		if (d3.event.sourceEvent || initially_fire_callback){
			initially_fire_callback = false;
		  	var extent = brush.extent()
		  
		 	// if empty when rounded, use floor & ceil instead
			if (extent[0] <= extent[1]) {
				extent[0] = Math.floor(extent[0]/brush_extent_round)*brush_extent_round;
				extent[1] = Math.floor(extent[1]/brush_extent_round)*brush_extent_round;
			}
			console.log(brush.extent(), extent)
		
			d3.select(this).transition()
			.call(brush.extent(extent))
			.call(brush.event);
		
			callback(extent);
		}
		else{
			return; // only transition after input
		}
	}
};
