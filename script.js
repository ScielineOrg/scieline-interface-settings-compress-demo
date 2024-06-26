$(document).ready(function() {
    let originalChart = null;
    let compressedChart = null;
    let data = [];

    const generateData = (numPoints, minTemp, maxTemp) => {
        const generatedData = [];
        const startTime = new Date();
        let value = (minTemp + maxTemp) / 2; // start temperature in the middle of the range
        for (let i = 0; i < numPoints; i++) { // generate data points
            const time = new Date(startTime.getTime() + i * 3600000); // each hour
            value += (Math.random() - 0.5) * (maxTemp - minTemp) / 10; // simulate realistic fluctuations
            value = Math.max(minTemp, Math.min(maxTemp, value)); // ensure value stays within range
            generatedData.push({ time, value });
        }
        return generatedData;
    };

    const plotGraph = (data, canvasId, title, existingChart, editable = false) => {
        if (existingChart) {
            existingChart.destroy();
        }

        const ctx = document.getElementById(canvasId).getContext('2d');
        ctx.canvas.height = 300; // Ensure the canvas height is set to 300px

        const chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.time),
                datasets: [{
                    label: title,
                    data: data.map(d => ({
                        x: d.time,
                        y: d.value,
                        reason: d.reason
                    })),
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1,
                    fill: false,
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour',
                            tooltipFormat: 'MMM d, h:mm a'
                        },
                        title: {
                            display: true,
                            text: 'Date and Time'
                        },
                        ticks: {
                            callback: function(value, index, values) {
                                return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' });
                            }
                        }
                    },
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Temperature'
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const dataPoint = context.raw;
                                if (canvasId === 'compressedChart') {
                                    return `Temperature: ${dataPoint.y}, Reason: ${dataPoint.reason}`;
                                }
                                return `Temperature: ${dataPoint.y}`;
                            },
                            title: function(context) {
                                const date = context[0].label;
                                return `Date: ${date}`;
                            }
                        }
                    }
                },
                onClick: function(event, elements) {
                    if (editable && elements.length > 0) {
                        const index = elements[0].index;
                        const newValue = prompt("Enter new temperature value:", data[index].value);
                        if (newValue !== null) {
                            data[index].value = parseFloat(newValue);
                            originalChart = plotGraph(data, 'originalChart', 'Original Data', originalChart, true);
                        }
                    }
                }
            }
        });

        return chart;
    };

    const updateGraphs = () => {
        const numPoints = $('#numPoints').val();
        const minTemp = $('#minTemp').val();
        const maxTemp = $('#maxTemp').val();

        data = generateData(numPoints, minTemp, maxTemp);
        originalChart = plotGraph(data, 'originalChart', 'Original Data', originalChart, true);

        $('#execute').click(() => {
            const minFreq = $('#minFreq').val();
            const maxChange = $('#maxChange').val();
            const compressedData = compressData(data, maxChange, minFreq);
            compressedChart = plotGraph(compressedData, 'compressedChart', 'Compressed Data', compressedChart);
        });
    };

    $('#generate').click(updateGraphs);

    // Generate initial data and plot
    updateGraphs();
});
