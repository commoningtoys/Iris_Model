class Plot {
    constructor(parent, x, y, colors) {
        this.points = [];
        // for(let i = 0; i < 100; i++)this.points.push(new GPoint(i, random(i)));
        this.plot = new GPlot(parent, x, y, WIDTH() / 2, HEIGHT() / 2);

        this.plot.getXAxis().setAxisLabelText("x axis");
        this.plot.getYAxis().setAxisLabelText("y axis");

        Object.keys(colors).forEach(key =>{
            // console.log(key);
            this.plot.addLayer(key, this.points);
            this.plot.getLayer(key).setLineColor(colors[key]);
        })
        // this.plot.setPoints(this.points);
        // this.plot.setLineColor(color(0, 255, 0))
        // Draw it!
        // this.plot.defaultDraw();
    }
    show(points, i){
        this.plot.beginDraw();
        this.plot.drawBackground(color(51));
        this.plot.drawBox();
        this.plot.drawXAxis();
        this.plot.drawYAxis();

        if(points instanceof Object){
            Object.keys(points).forEach(key =>{
                const newPoint = points[key];
                this.plot.getLayer(key).addPoint(new GPoint(i, newPoint[newPoint.length - 1]));
                this.plot.getLayer(key).drawLines();
                if(i  > MAXIMUM)this.plot.getLayer(key).removePoint(0);
            })
        }else{
            console.error(`${points} is the wrong data, please use a Object`)
        }
        // console.log(this.points)
        // let index = 0;
        // for (const num of arr) {
            // this.plot.addPoint(new GPoint(i, num));
            // this.points.push(new GPoint(i, num));
            // index++;
        // }
        // this.plot.setPoints(this.points);
        // this.plot.drawTopAxis();
        // this.plot.drawRightAxis();
        // this.plot.drawLines();
        // this.plot.drawTitle();
        // this.plot.drawFilledContours(GPlot.HORIZONTAL, 0.05);
        // this.plot.drawPoint(new GPoint(65, 1.5), mug);
        // this.plot.drawPolygon(polygonPoints, p.color(255, 200));
        this.plot.drawLabels();
        this.plot.endDraw();
    }
}