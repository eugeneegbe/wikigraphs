/* Scales */
var x = d3.scale.ordinal().domain(d3.range(matrix_size)).rangeBands([0, width]);
var tooltip_elements = ['percentage'];
var data_transformation = function(matrix){
	for(i=0;i<matrix_size;i++){
		var high = 0;
		for(j=0;j<matrix_size;j++){ 
			if(matrix[i][j]>high){
		        	high = matrix[i][j];
			}
		}
		for(j=0;j<matrix_size;j++){
		        if(high){
				matrix[i][j]={'value': matrix[i][j], 'percentage':(matrix[i][j]/high)*100 };
		        }
			else{
				matrix[i][j]={'value': 0, 'percentage':0 };
			}
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
		        }).on('mouseover', function(d,i){
		                //Highlighting the row text
		                d3.selectAll(".row text").classed("active", function(d, i) { return false; });
		                d3.select(d3.selectAll('.row text')[0][i]).attr('class','active');
		        });
	row.selectAll('.cell').data(function(d) { return d; }).enter().append('rect').attr('class', 'cell')
		        .attr('x', function(d, i)  { 
		                return x(i); 
		        }).attr('width', x.rangeBand())
		        .attr('height', x.rangeBand())
		        .on('mouseover', function(d,i){
		                //Highlighting the column index
		                d3.selectAll(".column text").classed("active", function(d, i) { return false; });
		                d3.select(d3.selectAll('.column text')[0][i]).attr('class','active');
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
		        return 'translate(' + x(i) + ')rotate(-90)'; 
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
		return 	d;
	}));
};

var annotate_graph = function(){
	//Adding Title
	var title = 'Article Cohort Longevity';
	$('.title').text(title);
	
	//Adding Notes
	var notes = $('<ul><li>When an article has edits >= 5/month the article is considered active.</li>\
<li>Articles are grouped by the month in which they were created.</li>\
<li>X-axis(month), Y-axis(editor group)</li>\
<li>Each row in the graph represents the activity of an editor group, eg: Editors who made their first edit in Jan 05.</li>\
<li>Each column in a row gives the percentage of editors who were active in a given month(column) from a group(row).</li>\
<li>The selector lets you filter the graph by percentage. The default selection is 0% - 100%.</li></ul>');
	$('#notes').append(notes);
};

var init_page = function(){
	matrix = data_transformation(matrix);
	init_graph(matrix);
	annotate_graph();
};
