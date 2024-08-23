// Data URLs for three different datasets
const kickstarterPledges = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json';
const videoGameSales = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json';
const movieSales = 'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json';

function createTreemap(data, container) {
    // Set up the SVG dimensions and margins for Treemap
    const width = 960; 
    const height = 600;
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    // Create the SVG container with responsive sizing
    const svg = d3.select(container).append('svg')
        .attr('viewBox', `0 0 ${width} ${height}`) // Creates a viewBox for responsive scaling
        .attr('preserveAspectRatio', 'xMidYMid meet'); // Maintains aspect ratio while scaling

    // Define the D3 treemap layout
    const treemap = d3.treemap()
        .size([width - margin.left - margin.right, height - margin.top - margin.bottom])
        .padding(1);

    // Process the input data using d3.hierarchy and sum up values
    const root = d3.hierarchy(data)
        .sum(d => d.value); // Sum up values to create treemap hierarchy

    // Compute the treemap layout based on the hierarchy
    treemap(root);

    // Create tooltip using element selection
    const tooltip = d3.select('#tooltip');

    // Create color scale for categories, ensuring sufficient color variation
    const categories = Array.from(new Set(root.leaves().map(d => d.data.category))); // Get unique categories
    const colorScale = d3.scaleOrdinal()
        .domain(categories) // Map categories to colors
        .range(d3.schemeSet3.concat(d3.schemeTableau10)); // Use D3 color schemes to cover a wide range of colors

    // Create a group (`g`) for each tile in the treemap
    const nodes = svg.selectAll('g')
        .data(root.leaves())
        .enter().append('g')
        .attr('transform', d => `translate(${d.x0}, ${d.y0})`); // Position each group based on treemap coordinates

    // Append rectangles for each tile in the treemap
    nodes.append('rect')
        .attr('class', 'tile')
        .attr('data-name', d => d.data.name)
        .attr('data-category', d => d.data.category)
        .attr('data-value', d => d.data.value)
        .attr('width', d => d.x1 - d.x0) // Set width based on treemap layout
        .attr('height', d => d.y1 - d.y0) // Set height based on treemap layout
        .style('fill', d => colorScale(d.data.category)) // Fill color based on category
        .on('mouseover', function(event, d) { // Tooltip interaction
            tooltip.style('visibility', 'visible')
                .text(`Name: ${d.data.name} | Category: ${d.data.category} | Value: ${d.data.value}`)
                .attr('data-value', d.data.value);
        })
        .on('mousemove', function(event) { // On mouse move
            tooltip.style('top', (event.pageY + 5) + 'px') 
                .style('left', (event.pageX + 5) + 'px'); // Position tooltip from top left
        })
        .on('mouseout', function() { // When not hovering
            tooltip.style('visibility', 'hidden'); // Hide tooltip 
        });

    // Append text labels to the treemap tiles
    nodes.append('text')
        .attr('x', 5)
        .attr('y', 20)
        .attr('fill', 'black')
        .style('font-size', d => { // Dynamically adjust the font size based on tile dimensions
            const boxWidth = d.x1 - d.x0;
            const boxHeight = d.y1 - d.y0;
            const minSize = Math.min(boxWidth, boxHeight);
            return Math.max(10, minSize / 5) + 'px';  // Font size proportional to box size
        })
        .text(d => d.data.name) // Display the name of the category/item
        .style('display', d => {
            // Hide text if the tile is too small to fit it
            const boxWidth = d.x1 - d.x0;
            const boxHeight = d.y1 - d.y0;
            return boxWidth > 50 && boxHeight > 20 ? 'block' : 'none';
        });

    // Dynamically generate and size the legend based on categories
    const legendWidth = 250;
    const legendItemSize = 20;
    const maxRows = 3;

    // Create a separate SVG container for the legend
    const legend = d3.select(container).append('svg')
        .attr('id', 'legend')
        .attr('viewBox', `0 0 ${legendWidth} ${maxRows * 30}`) // Make the legend responsive with viewBox
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('overflow', 'hidden');

    // Calculate the number of columns based on category count
    const numCols = Math.ceil(categories.length / maxRows); 

    // Create legend items, dynamically positioning them in rows and columns
    const legendItems = legend.selectAll('g')
        .data(categories)
        .enter().append('g')
        .attr('class', 'legend-box')
        .attr('transform', (d, i) => {
            const row = Math.floor(i / numCols);
            const col = i % numCols;
            return `translate(${col * ((legendWidth) / numCols)}, ${row * 30})`; // Position based on grid layout
        });

    // Add rectangles to the legend, one for each category
    legendItems.append('rect') 
        .attr('class', 'legend-item')
        .attr('x', 7)
        .attr('y', 0)
        .attr('height', legendItemSize)
        .attr('width', legendWidth / numCols - 10)
        .style('fill', d => colorScale(d)); // Fill color based on category


    // Add text labels to the legend items
    legendItems.append('text') 
        .attr('x', (legendWidth / numCols) / 2) // Center the text within the box
        .attr('y', legendItemSize / 1.5) // Vertical centering
        .attr('text-anchor', 'middle') // Center align the text horizontally
        .style('font-size', '9px')
        .style('fill', 'black')
        .text(d => d); // Use category name as the legend label
}

// Function to initialize the charts 
function initializeCharts() {
    // Load data and create treemaps for each dataset
    d3.json(kickstarterPledges).then(data => createTreemap(data, '#kickstarter-chart'));
    d3.json(videoGameSales).then(data => createTreemap(data, '#videoGame-chart'));
    d3.json(movieSales).then(data => createTreemap(data, '#movie-chart'));

    // Menu interaction for switching between charts
    d3.select('#menu').on('click', () => {
        d3.select('#menu-content').style('display', 'block');
    });
    d3.selectAll('#menu-content div').on('click', function() {
        const chartId = d3.select(this).attr('data-chart');
        d3.selectAll('.chart-container').style('display', 'none');
        d3.select(`#${chartId}`).style('display', 'block');
        d3.select('#menu-content').style('display', 'none');

        updatePage(chartId);
    });

    // Initialize the page with the first chart visible
    d3.select('#kickstarter-chart').style('display', 'block'); 
    // Set initial chart info
    updatePage('kickstarter-chart'); 
}

// Function to update the page title and description based on the selected chart
function updatePage(chartId) {
    let titleText;
    let descriptionText;

    switch(chartId) {
        case 'kickstarter-chart':
            titleText = 'KickStarter Project Sales';
            descriptionText = 'This chart visualizes Kickstarter funding data, highlighting the funding received by different projects in various categories.';
            break;
        case 'videoGame-chart':
            titleText = 'Video Game Sales';
            descriptionText = 'This chart displays video game sales data, showing how different games have performed in terms of sales across various categories.';
            break;
        case 'movie-chart':
            titleText = 'Movie Sales';
            descriptionText = 'This chart represents movie sales data, illustrating how different movies have performed in terms of sales across multiple categories.';
            break;
        default:
            titleText = 'TreeMap Diagrams';
            descriptionText = 'Select a chart to view its description.';
            break;
    }

    // Update the DOM elements with the new title and description
    d3.select('#title').text(titleText);
    d3.select('#description').text(descriptionText);
}

initializeCharts();
