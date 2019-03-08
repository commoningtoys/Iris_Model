class Plot {
    constructor() {




        this.data = [100, 2, 8, 7, 7, 88, 9];
        this.date = {};

        this.margin = { top: 50, right: 50, bottom: 50, left: 50 }
        const width = 500 - this.margin.left - this.margin.right // Use the window's width 
        const height = 350 - this.margin.top - this.margin.bottom; // Use the window's height
        this.plot = d3.select("#d3").append("svg")
            .attr("width", width + this.margin.left + this.margin.right)
            .attr("height", height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
        this.parse_time = d3.timeParse("%Y-%m-%d-%H")("2018-01-01-00");

        // set the ranges
        this.x_axis = d3.scaleTime().range([0, width]);
        this.y_axis = d3.scaleLinear().range([height, 0]);

        // Add the X Axis
        this.plot.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(this.x_axis));

        // Add the Y Axis
        this.plot.append("g")
            .call(d3.axisLeft(this.y_axis));

        this.line = d3.line()
            .x((d, i) => this.x_axis(i))
            .y((d, i) => this.y_axis(d));
        // Scale the range of the data
        // this.x_axis.domain(arr.length);
        // this.y_axis.domain([0, Math.max(...arr)]);

        // Add the this.line path.
        this.plot
            .datum(this.data)
            .append("path")
            .attr("class", "line")
            .attr("d", this.line);
    }
    draw(data, date) {
        this.data = data;
        this.date = date;
        // console.log(this.data['curious'].fld);
        const arr = this.data['curious'].fld;

        this.line = d3.line()
            .x((d, i) => this.x_axis(i))
            .y((d, i) => this.y_axis(d));

        this.plot.select('#d3')
            .datum(arr)
            .append("path")
            .attr("class", "line")
            .attr("d", this.line);
        // .attr('fill', 'none')
        console.log(this.plot)

    }
    set_w_h(w, h) {
        this.plot
            .attr("width", w + this.margin.left + this.margin.right)
            .attr("height", h + this.margin.top + this.margin.bottom)
    }
}