



window.onload = function () {


/* Global variables affecting the visualizations, bad practice but oh well :(  ) */
var bins = 10;

var CLTfreq =  {
  "data" :  [
  {"bin": "1.0", "frequency": 0}, 
  {"bin": "1.2", "frequency": 0}, 
  {"bin": "1.4", "frequency": 0}, 
  {"bin": "1.6", "frequency": 0},
  {"bin": "1.8", "frequency": 0},
  {"bin": "2.0", "frequency": 0},
  {"bin": "2.2", "frequency": 0},
  {"bin": "2.4", "frequency": 0},
  {"bin": "2.6", "frequency": 0},
  {"bin": "2.8", "frequency": 0},
  {"bin": "3.0", "frequency": 0}]
};


/* Event Listeners */
document.getElementById("genCLT").addEventListener("click", genCLT);
document.getElementById("genLLN").addEventListener("click", genLLN);
document.getElementById("resetCLT").addEventListener("click", resetCLT);
document.getElementById("genDFT").addEventListener("click", genDFT);



//setup the general question
genSetup()

function genSetup(){
  let numVals = 3;
  let vals = [0.33,0.33,0.33];
  let xvals = [1,2,3];
  let n = 5;

  //generate the prompt and table text
  q_text = "Assume a sample size of "+n.toString()+" for every individual sample. Observe how the distribution of sample means changes as you record more and more sample means for the following underlying random variable: ";
  let table_text = "<tr> <th> Probability </th> <th> X </th> </tr>";
  for (let i = 0; i < vals.length; i++){
    newval = Math.round(vals[i] * 100) / 100;
    table_text = table_text + "<tr> <th>" + newval.toString() + "</th> <th>"+ xvals[i].toString() +"</th> </tr>";
  }

  //write the answers to the output table
  document.getElementById("CLTText").innerHTML = q_text;
  document.getElementById("CLTTable").innerHTML = table_text;

  // generate the LLN information
  q_text_lln = "Assume a sample size of "+n.toString()+" for every individual sample. Observe how the sample means converges in expectation to the theoretical mean as you record more and more sample means for the following underlying random variable: ";
  document.getElementById("LLNText").innerHTML = q_text_lln;
  document.getElementById("LLNTable").innerHTML = table_text;

  //generate the DFT information
  q_text_dft = "Consider what happens to the shape of the t-distribution as the degrees of freedom are increased. How might economists be \
  able to take advantage of this property?"
  document.getElementById("DFTText").innerHTML = q_text_dft



}


function genSampMean(){
  let sampSize = 5;
  let sampTotal = 0;

  //generate samples
  for (let i = 0; i < sampSize; i++){
    ranVal = getRandomInt(1, 3);
    sampTotal += ranVal;
  }
  //find the current sample means and add it to our data
  sampMean = sampTotal/sampSize;
  bucket = Math.round((sampMean - 1) / 0.2);

  //place in the correct bucket
  CLTfreq.data[bucket].frequency += 1;

}



function genCLT(){

  //read in the desired number of samples
  let numSamps = Number(document.getElementById("numSamples").value);

  for (let i = 0; i < numSamps; i ++){genSampMean()}

  var formatCount = d3.format(",.0f");

  /* prep the svg canvas and axis scalings */
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 350 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

  var x = d3.scaleLinear()
  .domain([1,3])
  .rangeRound([0, width]);

  var y = d3.scaleLinear()
  .domain([0, d3.max(CLTfreq['data'], function(d) { return d.frequency; })])
  .range([height, 0]);


  /* remove previous run and create a new svg */
  d3.select("#clt_dataviz").select("svg").remove();

  var svg = d3.select("#clt_dataviz").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  /* locate the position of datapoints */
  var barr = svg.selectAll(".barr")
  .data(CLTfreq['data'])
  .enter().append("g")
  .attr("key",function(d,i){ return i;})
  ;

  /* populate the bar chart with correct positioning and heights */
  var bar = svg.selectAll(".bar")
  .data(CLTfreq['data'])
  .enter().append("g")
  .attr("class", "bar")
  .attr("transform", function(d,i) { return "translate(" + x((i/5 + 1) - 1/10  ) + "," + y(d.frequency) + ")"; });

  /* create the rectangles in the visualization */
  bar.append("rect")
  .attr("x", 1)
  .attr("width", width/bins)
  .attr("height", function(d) { return height - y(d.frequency); })
  .attr("fill", "rgb(126, 232, 107, 0.5)")
  ;

  svg.append("g")
  .attr("class", "axis axis--x")
  .attr("transform", "translate(0," + height + ")")
  .call(d3.axisBottom(x));

  svg.append("text")
    .attr("class", "x label")
    .attr("text-anchor", "middle")
    .attr("x", width/2)
    .attr("y", height * 1.09)
    .text("Sample Mean");

  }



function resetCLT(){
  //set each frequency bucket equal to zero
  for (let i = 0; i < 11; i++){
    CLTfreq.data[i].frequency = 0;
  }
  /* remove previous svg */
  d3.select("#clt_dataviz").select("svg").remove();

}



function genLLNData(maxSamp){
  let sampSize = 5;
  let expMean = 0;
  let TheoMean = 2;

  data = [];

  //generate samples means
  for (let i = 0; i < maxSamp; i++){
    currSamp = 0;
    //generate samples within a sample mean
    for (let j = 0; j < sampSize; j++){
      currSamp += getRandomInt(1, 3);
    }
    currMean = currSamp/sampSize;
    expMean = (i/(i+1)) * expMean + (1/(i+1)) * currMean;

    data.push({"x": i+1, "y": expMean, "z": TheoMean});
  }

  return data;

}


function genLLN(){

  //read in the desired number of samples
  let numSamps = Number(document.getElementById("numLLNSamps").value);

  //generate the data for the visualization
  LLNdata = genLLNData(numSamps);

  /* prep the svg canvas and axis scalings */
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 350 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

const xScale = d3.scaleLinear()
  .domain([1, numSamps])
  .range([0, width]) // 600 is our chart width
 
const yScale = d3.scaleLinear()
  .domain([1, 3])
  .range([height, 0]) // 400 is our chart height

const lineSamp = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y))
  .curve(d3.curveCatmullRom.alpha(.5))

const lineTheo = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.z))
  .curve(d3.curveCatmullRom.alpha(.5))

  /* remove previous run and create a new svg */
  d3.select("#lln_dataviz").select("svg").remove();

  var svg = d3.select("#lln_dataviz").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


  // add a empirical mean path to the existing svg
  svg.append('path')
    .datum(LLNdata)
    .attr('d', lineSamp)
    .attr("fill", "none")
    .attr("stroke", "rgb(0,0,0)")
    .attr("id", "Emp");


    /* Animate the sampling mean updates */
    const updatedPathSamp = d3.select("#lln_dataviz").select("svg")
      .select("path#Emp")
      .interrupt()
      .datum(LLNdata)
      .attr("d", lineSamp);
    const pathLengthSamp = updatedPathSamp.node().getTotalLength();
    const transitionPathSamp = d3
      .transition()
      .ease(d3.easeSin)
      .duration(2500);
    updatedPathSamp
      .attr("stroke-dashoffset", pathLengthSamp)
      .attr("stroke-dasharray", pathLengthSamp)
      .transition(transitionPathSamp)
      .attr("stroke-dashoffset", 0);


  // add a theoretical mean path to the existing svg
  svg.append('path') 
    .datum(LLNdata)
    .attr('d', lineTheo)
    .attr("fill", "none")
    .attr("stroke", "rgb(126, 232, 107)")
    .attr("id", "Theo");

    /* Animate the theoretical mean updates */
    const updatedPathTheo = d3.select("#lln_dataviz").select("svg")
        .select("path#Theo")
        .interrupt()
        .datum(LLNdata)
        .attr("d", lineTheo);
      const pathLengthTheo = updatedPathTheo.node().getTotalLength();
      const transitionPathTheo = d3
        .transition()
        .ease(d3.easeSin)
        .duration(2500);
      updatedPathTheo
        .attr("stroke-dashoffset", pathLengthTheo)
        .attr("stroke-dasharray", pathLengthTheo)
        .transition(transitionPathTheo)
        .attr("stroke-dashoffset", 0);


  
      // call the x axis
      svg.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(xScale));

    //call the y axis
    svg.append("g")
              .call(d3.axisLeft(yScale));

    //x-axis text
    svg.append("text")
              .attr("class", "x label")
              .attr("text-anchor", "middle")
              .attr("x", width/2)
              .attr("y", height * 1.09)
              .text("Number of Sample Means Considered");
              

}


function genDFTdata(min, max){
  lowdf = 1;
  highdf = 10000;

  data = [];

  lastval = min - 0.1;
  for (let i = min; i < max; i += 0.1){
    //create new calculated values uniformly
    //newval = min + i/(max-min);
    newval = i
    //console.log(compute_tdist(newval, lowdf));
    lowdfprob = compute_tdist(newval, lowdf) - compute_tdist(lastval, lowdf);
    highdfprob = compute_tdist(newval, highdf) - compute_tdist(lastval, highdf);

    data.push({"x": newval, "y": lowdfprob * 10, "z": highdfprob * 10});
    lastval = newval;
  }




  return data;

}




function genDFT(){
  min = -10;
  max = 10;


  DFTdata = genDFTdata(min, max);

  /* prep the svg canvas and axis scalings */
  var margin = {top: 30, right: 30, bottom: 30, left: 30},
  width = 350 - margin.left - margin.right,
  height = 350 - margin.top - margin.bottom;

const xScale = d3.scaleLinear()
  .domain([min, max])
  .range([0, width])
 
const yScale = d3.scaleLinear()
  .domain([0, 0.5])
  .range([height, 0])

const line = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.y));

const line2 = d3.line()
  .x(d => xScale(d.x))
  .y(d => yScale(d.z));


  /* remove previous run and create a new svg */
  d3.select("#dft_dataviz").select("svg").remove();

  var svg = d3.select("#dft_dataviz").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");




  document.getElementById("DegFreeText").innerHTML = "D.F. = 1";

  svg.append('path')
    .datum(DFTdata)
    .attr('d', line)
    .attr("fill", "none")
    .attr("stroke", "rgb(0,0,0)")
    .attr("id", "Begin");
  
    // call the x axis
    svg.append("g")
              .attr("class", "axis axis--x")
              .attr("transform", "translate(0," + height + ")")
              .call(d3.axisBottom(xScale));

    //call the y axis
    svg.append("g")
              .call(d3.axisLeft(yScale));

    //x-axis text
    svg.append("text")
              .attr("class", "x label")
              .attr("text-anchor", "middle")
              .attr("x", width/2)
              .attr("y", height * 1.09)
              .text("t-value");
              
      /* Animate the update animation */
      setTimeout(function(){

        document.getElementById("DegFreeText").innerHTML = "D.F. = 10000";

        // Updata the line
        svg.select("path")
        .enter()
        .append("path")
        .attr("class","lineTest")
        .datum(DFTdata)
        .merge(svg.select("path"))
        .transition()
        .duration(3000)
        .attr("d", line2);
      }, 2000);




}




























}



















/************************** HELPER FUNCTIONS *******************************/

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


/* t-distribution functions from view-source:https://www.math.ucla.edu/~tom/distributions/tDist.html */
function LogGamma(Z) {
	with (Math) {
		var S=1+76.18009173/Z-86.50532033/(Z+1)+24.01409822/(Z+2)-1.231739516/(Z+3)+.00120858003/(Z+4)-.00000536382/(Z+5);
		var LG= (Z-.5)*log(Z+4.5)-(Z+4.5)+log(S*2.50662827465);
	}
	return LG
}

function Betinc(X,A,B) {
	var A0=0;
	var B0=1;
	var A1=1;
	var B1=1;
	var M9=0;
	var A2=0;
	var C9;
	while (Math.abs((A1-A2)/A1)>.00001) {
		A2=A1;
		C9=-(A+M9)*(A+B+M9)*X/(A+2*M9)/(A+2*M9+1);
		A0=A1+C9*A0;
		B0=B1+C9*B0;
		M9=M9+1;
		C9=M9*(B-M9)*X/(A+2*M9-1)/(A+2*M9);
		A1=A0+C9*A1;
		B1=B0+C9*B1;
		A0=A0/B1;
		B0=B0/B1;
		A1=A1/B1;
		B1=1;
	}
	return A1/A
}

function compute_tdist(X, df) {
    with (Math) {
		if (df<=0) {
			alert("Degrees of freedom must be positive")
		} else {
			A=df/2;
			S=A+.5;
			Z=df/(df+X*X);
			BT=exp(LogGamma(S)-LogGamma(.5)-LogGamma(A)+A*log(Z)+.5*log(1-Z));
			if (Z<(A+1)/(S+2)) {
				betacdf=BT*Betinc(Z,A,.5)
			} else {
				betacdf=1-BT*Betinc(1-Z,.5,A)
			}
			if (X<0) {
				tcdf=betacdf/2
			} else {
				tcdf=1-betacdf/2
			}
		}
		tcdf=round(tcdf*100000)/100000;
	}
    return tcdf;
}










/* Some attribution for d3 animation goes to https://medium.com/@louisemoxy/create-a-d3-line-chart-animation-336f1cb7dd61 and https://d3-graph-gallery.com/graph/line_change_data.html*/