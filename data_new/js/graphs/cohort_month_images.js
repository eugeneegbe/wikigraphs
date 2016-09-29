/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, width]);
var tooltip_elements = ['percentage', 'weight'];
var cell_width;
var data_transformation = function(matrix){
	var highest_total = 0;
	for(i=0;i<matrix_size;i++){
		var total = 0;
		for(j=0;j<matrix_size;j++){ 
			if(matrix[j][i]){
		        	total += matrix[j][i];
			}
		}
		if(highest_total < total){
			highest_total = total;
		}
		for(j=0;j<matrix_size;j++){
		        if(total){
		                console.log(i,j,total, matrix[j][i], Math.round((matrix[j][i]/total)*100));
				matrix[j][i] = {
							'value':matrix[j][i] , 
							'percentage':(matrix[j][i]/total)*100,
							'weight':total
						};
		        }
			else{
				matrix[j][i] = {
							'value':0 , 
							'percentage':0,
							'weight':0
						};
			}
		}
	}
	cell_width = d3.scale.linear().domain([0, highest_total]).range([0, 30]).clamp(true);
	//cell_width = d3.scale.linear().domain([0, 1000]).range([0, 30]).clamp(true);
	for(i=0;i<matrix_size;i++){
		var x = 0;
		for(j=0;j<matrix_size;j++){
			matrix[i][j]['x'] = x;
			x += cell_width(matrix[i][j]['weight']);
		}
	}
	return matrix;
};
var init_graph = function(matrix){
	var graph_container = d3.select('#viz').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.style('margin-left', margin.left + 'px').append('g')
		.attr('transform', 'translate('  + graph_axis_text_width + ',' + (50 + graph_axis_text_width) + ')')
		.append('g');
	graph_container.append('rect').attr('class', 'background').attr('width', width).attr('height', height-50);
	var row = graph_container.selectAll('.row').data(matrix).enter().append('g').attr('class', 'row')
		        .attr('transform', function(d, i){
		                return  'translate(0,' + x(i) + ')';
		        }).attr('cohort', function(d, i)  { 
		                var date = time_format.parse(date_reverse_lookup[i]);
			        return time_format(date);
		        }).on('mouseover', function(d,i){
		                //totallighting the row text
		                d3.selectAll(".row text").classed("active", function(d, i) { return false; });
		                d3.select(d3.selectAll('.row text')[0][i]).attr('class','active');
		        });
	row.selectAll('.cell').data(function(d) { return d; }).enter().append('rect').attr('class', 'cell')
		        .attr('x', function(d, i)  { 
		                return d.x; 
		        }).attr('width', function(d, i){
				return cell_width(d.weight);
			})
		        .attr('height', x.rangeBand())
			.attr('value', function(d, i)  { 
				return d.value; 
			}).attr('percentage', function(d, i)  { 
				return d.percentage; 
			}).attr('weight', function(d, i)  { 
				return d.weight; 
			}).attr('month', function(d, i)  { 
				var date = time_format.parse(date_reverse_lookup[i]);
				return time_format(date);
			})
			.attr('cohort', function(d, i)  { 
				var row = d3.select(this.parentNode);
				return row.attr('cohort');
			})
		        .on('mouseover', function(d,i){
		                //totallighting the column index
		                d3.selectAll(".column text").classed("active", function(d, i) { return false; });
		                d3.select(d3.selectAll('.column text')[0][i]).attr('class','active');
				
				var elem = d3.select(this);
				showTooltip(elem, '#viz g', tooltip_elements);
		        }).on('mouseout', function(){
				hideTooltip();
			});
	row.append('line').attr('x2', width);
	row.append('text').attr('x', 0).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
		.attr('text-anchor', 'end')
		.text(function(d,  i) {
		        var date = time_format.parse(date_reverse_lookup[i]);
		        return time_format(date);
		});
	var column = graph_container.selectAll('.column').data(matrix).enter().append('g').attr('class', 'column')
		.attr('transform', function(d, i)  { 
		        return 'translate(' + d[0].weight + ')rotate(-90)'; 
		});
	column.append('line').attr('x1', -width);
	column.append('text').attr('x', 0).attr('y', x.rangeBand() / 2).attr('dy', '.32em')
		.attr('text-anchor', 'start')
		.text(function (d, i) { 
		        var date = time_format.parse(date_reverse_lookup[i]);
		        return time_format(date);
		});
	/* row.selectAll('.cell').data(function(d, i) { return matrix[i]; }).style('fill', z); */
	var brush_options ={
				'height': 30,
				'width': 1000,
				'domain': [0,100],
				'extent': [0,100],
				'ticks': 100,
				'round': 1,
	};
	init_brush(brush_options, make_filter(row,matrix,[0,0,0,100,100,100],['#ffffff', '#ffffff', '#e5f5f9','#00441b', '#ffffff', '#ffffff'], function(d){
		return 	d.percentage;
	}));
};

var annotate_graph = function(){
	createTooltip(tooltip_elements);
};

var init_page = function(){
	matrix = data_transformation(data);
	init_graph(matrix);
	annotate_graph(tooltip_elements);
};

window.onload = function(){
	init_page();
};