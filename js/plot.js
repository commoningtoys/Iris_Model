class Plot {
    constructor(parent, x, y) {
        this.points = [];
        // for(let i = 0; i < 100; i++)this.points.push(new GPoint(i, random(i)));

        this.plot = new GPlot(parent, x, y, WIDTH() / 2, HEIGHT() / 2);

        this.plot.setPoints(this.points);

        this.plot.getXAxis().setAxisLabelText("x axis");
        this.plot.getYAxis().setAxisLabelText("y axis");
        this.plot.setLineColor(color(0, 255, 0))
        // Draw it!
        // this.plot.defaultDraw();
    }

    show(num, i) {
        // console.log(this.points)
        // let index = 0;
        // for (const num of arr) {
            this.plot.addPoint(new GPoint(i, num));
            // this.points.push(new GPoint(i, num));
            // index++;
        // }
        // this.plot.setPoints(this.points);
        this.plot.beginDraw();
        this.plot.drawBackground(color(51));
        this.plot.drawBox();
        this.plot.drawXAxis();
        this.plot.drawYAxis();
        // this.plot.drawTopAxis();
        // this.plot.drawRightAxis();
        this.plot.drawLines();
        // this.plot.drawTitle();
        // this.plot.drawFilledContours(GPlot.HORIZONTAL, 0.05);
        // this.plot.drawPoint(new GPoint(65, 1.5), mug);
        // this.plot.drawPolygon(polygonPoints, p.color(255, 200));
        this.plot.drawLabels();
        this.plot.endDraw();
        if(i  > MAXIMUM)this.plot.removePoint(0);
    }
}