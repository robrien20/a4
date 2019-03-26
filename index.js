var info = [
  {'park': 'Smoky Mountains', 'acres': 522427, 'peak visitation': 'July - 1,492,508 recreational visits', 'fun fact': 'The Smoky Mountains are among the oldest in the world - it is estimated the mountains in the Great Smoky Mountains National Park are between 200 and 300 million years old.'},
  {'park': 'Grand Canyon', 'acres': 1217403, 'peak visitation': 'July - 837,258 recreational visits', 'fun fact': 'The Grand Canyon is ~70 million years old, carved by the Colorado River.'},
  {'park': 'Zion', 'acres': 147551, 'peak visitation': 'July - 576,349 recreational visits', 'fun fact': "Visitors can choose to explore Zion's The Subway, which involves rapelling and swimming."},
  {'park': 'Rocky Mountains', 'acres': 265461, 'peak visitation': 'July - 885,478 recreational visits', 'fun fact': 'The Rocky Mountains are 76 million years old and their highest peak is Mount Elbert in Colorado which is 14,440 feet tall'},
  {'park': 'Yosemite', 'acres': 761266, 'peak visitation': 'July - 633,351 recreational visits', 'fun fact': 'During mid-late February, the waterfall Horsetail Fall appears to glow during sunsets.'},
  {'park': 'Yellowstone', 'acres': 2200000, 'peak visitation': 'July - 962,404 recreational visits', 'fun fact': 'Yellowstone is thought to be the first national park in the world.'},
  {'park': 'Acadia', 'acres': 47633, 'peak visitation': 'August - 762,436 recreational visits', 'fun fact': 'Located in Maine, it is said that Acadias Cadillac Mountain is the first place in the United States to get sunlight in the morning.'},
  {'park': 'Olympic', 'acres': 922650 , 'peak visitation': 'August - 764,282 recreational visits', 'fun fact': 'Within Olympic, there are three distinct ecosystems: subalpine forest and wildflower meadow, temperate forest, and the rugged Pacific coast'},
  {'park': 'Grand Teton', 'acres': 310000, 'peak visitation': 'July - 739,046 recreational visits' , 'fun fact':'Being the youngest mountain range in the Rocky Mountains, very little erosion has taken place, which allows for such an amazing landscape.'},
  {'park': 'Glacier', 'acres': 1013322, 'peak visitation': 'July - 1,009,665 recreational visits', 'fun fact': 'Glacier National Park is also known as the "Crown of the Continent."'},
  {'park': 'Joshua Tree', 'acres': 790636, 'peak visitation': 'March - 404,545 recreational visits', 'fun fact':'Joshua Tree is named for the Joshua trees (Yucca brevifolia) native to the park.'}
];

const log = console.log;
const margin = {top: 250, right: 0, bottom: 0, left: 100};
const width = 700 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

// define svg
const svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// park info
var park = d3.select("body").append("div")
    .attr("class", "parkinfo")
.append("text")
    .attr("class", "text--info"); //need to reference this class later

// load pre-processed data
d3.json("some.json")
    .then(ridgelinePlot);

// Creates the ridgeline plot/ oy plot
function ridgelinePlot(responses) {
    // accessors and pre-processed data
    const data = responses.children;
    const accessorName = d => d.name;
    const accesorValue = d => d.value;
    const overlap = 1.5;

    const allValues = data.map(d => { return d.children.map(accesorValue); })
        .reduce((acc, curVal) => acc.concat(curVal), []);

    // chart x axis
    const xScale = d3.scaleBand().domain(data[0].children.map(accessorName)).range([0, width]);
    const xValue = d => xScale(accessorName(d));
    const xAxis = d3.axisBottom(xScale);

    // chart y axis
    const yearScale = d3.scaleBand().domain(data.map(accessorName)).range([height, 0]);
    const yearValue = d => yearScale(accessorName(d));
    const yearAxis = d3.axisLeft(yearScale);

    // area scale
    const areaChartHeight = (1.35  + overlap) * (height / yearScale.domain().length);
    const yScale = d3.scaleLinear().domain(d3.extent(allValues)).range([areaChartHeight, 0]);
    const yValue = d => yScale(accesorValue(d));

    // area and line generators
    const area = d3.area().x(xValue).y1(yValue).curve(d3.curveBasis);
    const line = area.lineY1();

    // ordered to get a pleasing overlapping effect
    // However 2016 area is still behind 2017 area - d3 raise solves the issue
    // Further learning required to avoid this
    // https://beta.observablehq.com/@mbostock/d3-ridgeline-plot
    // https://beta.observablehq.com/@pstuffa/nyc-building-permits-api-neighborhood-trends
    //const order = ["Olympic", "Acadia", "Grand Teton", "Rocky Mountain", "Yellowstone", "Yosemite", "Zion", "Grand Canyon", "Glacier"].map(d => data.filter(p => p.name == d)[0]);
    const order = [ "Great Smoky Mountains", "Grand Canyon", "Zion", "Rocky Mountain", "Yosemite", "Yellowstone", "Acadia", "Olympic", "Grand Teton", "Glacier", "Joshua Tree"].map(d => data.filter(p => p.name == d)[0]);
    // year groups
    const gYear= svg.append('g').attr("class", "years")
        .selectAll(".year").data(order)
    .enter().append('g')
        .attr("class",d => "year year--" + d.name)
        .attr("transform", (d) => {
            const ty = yearValue(d) - yearScale.bandwidth() - 110;
            return `translate(0,${ty})`;
        });

    area.y0(yScale(0));

    // add x axis
    svg.append('g').attr("class", "axis axis--x")
        .attr("transform", `translate(-25,${height - 60})`)
    .call(xAxis);

    // add y axis
    svg.append('g').attr("class", "axis axis--year")
        .attr("transform", "translate(0,-47)")
    .call(yearAxis);

    // add area paths
    gYear.append('path').attr('class', 'area')
        .datum(d => d.children)
        .attr('d', area)

    // add line paths
    gYear.append('path').attr('class', 'line')
        .datum(d => d.children)
        .attr('d', line);

    // Add title text
    svg.append("text")
        .attr("class", "text--title")
        .attr("x", 120)
        .attr("y", -190)
        .html("Visitation Seasons of Top National Parks");

    // gets the desired overlapping effect
    order.slice(0, 1).forEach(d => {
        d3.select(`.year--${d.name}`).raise();
    });

    //highlight and pull up blurb on hover
    svg.selectAll('.area')
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut);

    function handleMouseOver(d, i) { //d: data in format {month, value}, i: index
      d3.select(this).attr("class", "hover");
      d3.select(".text--info").html(" ")
      d3.select(".text--info").style('visibility', 'visible');
      d3.select(".text--info").html(info[i]['park'].toString() ) //display name of park at bottom
          .append("text")
              .attr("class", "text--blurb")
              .html( "        " + "Number of acres: " + info[i]['acres'].toLocaleString() + "<br>" + "        " + "Peak visitation month: " + info[i]['peak visitation'] + "<br>")
          .append("text")
              .attr("class", "text--extra")
              .html( info[i]['fun fact']);
    }

    function handleMouseOut(d, i) {
      d3.select(this).attr("class", "area");
      d3.select(".text--info").style('visibility', 'visible');
    }
};
