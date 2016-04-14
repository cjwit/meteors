
var map = $('#map')
var svg = d3.select('svg')

var width = map.width(),
    height = map.height();

var div = d3.select('body')
    .append('div')
    .attr('class', 'info')
    .style('opacity', 0);

d3.json('world.json', function(error, world) {
    if (error) return console.error(error);
    var geodata = topojson.feature(world, world.objects.geodata)

    var projection = d3.geo.azimuthalEqualArea()
        .clipAngle(180 - 1e-3)
        .scale(237)
        .translate([width / 2, height / 2])
        .precision(.1);

/* SWAP THIS CODE FOR THE ABOVE TO CREATE A MORE STANDARD MERCATOR
    var projection = d3.geo.mercator()
        .scale((width + 1) / 2 / Math.PI)
        .translate([width / 2, height / 2])
        .precision(.1);

    // OR FOR THIS ONE FOR STEREOGRAPHIC
    var projection = d3.geo.stereographic()
        .scale(245)
        .translate([width / 2, height / 2])
        .rotate([-20, 0])
        .clipAngle(180 - 1e-4)
        .clipExtent([[0, 0], [width, height]])
        .precision(.1);

*/

    var path = d3.geo.path()
        .projection(projection)
        .pointRadius(2)

    var graticule = d3.geo.graticule();

    svg.append("path")
        .datum(graticule)
        .attr("class", "graticule")
        .attr("d", path);

    svg.selectAll('.land')
        .data(geodata.features)
      .enter().append('path')
        .attr('class', function(d) { return 'land ' + d.id })
        .attr('d', path)

    svg.append('path')
        .datum(topojson.mesh(world, world.objects.geodata, function(a, b) { return a !== b; }))
        .attr('d', path)
        .attr('class', 'boundary')

    var title = svg.append('g')
        .attr('class', 'title')
      .append('text')
        .text('Meteorite landings across the world')
        .attr('x', 100)
        .attr('y', 100)
        .style('text-anchor', 'left')

    var subtitle = svg.append('g')
        .attr('class', 'subtitle')
      .append('text')
        .text('Created by Christopher Witulski using data from FreeCodeCamp.com')
        .attr('x', 100)
        .attr('y', 125)
        .style('text-anchor', 'left')

    d3.json('meteors.json', function(error, meteors) {
        if (error) return console.error(error)
        var data = meteors.features;

        data = data.filter(function(value) {
            if (value.geometry) {
                return value
            }
        })

        var biggest = 0;
        data.forEach(function(value) {
            if (!value.properties.mass) {
                value.properties.mass = 0;
            }
            var mass = Number(value.properties.mass)
            if (mass > biggest) {
                biggest = value.properties.mass;
            }
        })
        console.log('max', biggest)
        console.log(Math.log(biggest))

        svg.selectAll('hit')
            .data(data)
          .enter().append('circle')
            .attr('cx', function(d) { return projection(d.geometry.coordinates)[0] })
            .attr('cy', function(d) { return projection(d.geometry.coordinates)[1] })
            .attr('class', 'hit')
            .attr('r', function(d) {
                var mass = d.properties.mass;
                if (mass > 10000000) { return 40 }
                if (mass > 1000000) { return 20 }
                if (mass > 100000) { return 8 }
                if (mass > 10000) { return 6 }
                if (mass > 1000) { return 4 }
                if (mass > 500) { return 3 }
                return 2
            })
            .on('mouseover', function(d) {
                div.transition()
                    .duration(0)
                    .style('opacity', .9);
                div .html(function() {
                    var text = '<span>Meteor name: ' + (d.properties.name ? d.properties.name : 'None given') + '</span><br>'
                    if (d.properties.mass) {
                        text += 'Mass: ' + (Number(d.properties.mass) / 1000) + ' kg<br>'
                    }
                    if (d.properties.year) {
                        text += 'Year: ' + new Date(d.properties.year).getFullYear() + '<br>'
                    }
                    return text
                })
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY - 50) + 'px')
            })
            .on('mouseout', function(d) {
                div.transition()
                    .duration(0)
                    .style('opacity', 0)
            })
    })
})
