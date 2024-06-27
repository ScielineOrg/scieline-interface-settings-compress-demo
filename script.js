$(document).ready(function() {
    let originalChart = null;
    let compressedChart = null;
    let data = [];

    const defaultTemperatures = [
        24.704, 24.941, 25.099, 25.35, 25.366, 25.043, 24.941, 26.447, 26.068, 26.052,
        26.052, 26.039, 26.039, 26.052, 25.996, 25.94, 25.9, 25.871, 25.83, 25.758,
        25.646, 25.168, 23.886, 23.873, 24.239, 24.156, 24.551, 24.351, 23.86, 24.858,
        25.085, 26.308, 26.039, 26.012, 25.969, 25.969, 25.927, 25.927, 25.94
    ];

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

    const loadDefaultData = () => {
        const generatedData = [];
        const startTime = new Date();
        for (let i = 0; i < defaultTemperatures.length; i++) {
            const time = new Date(startTime.getTime() + i * 3600000); // each hour
            const value = defaultTemperatures[i];
            generatedData.push({ time, value });
        }
        return generatedData;
    };

    const loadCsvData = (csvData) => {
        const values = csvData.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        const generatedData = [];
        const startTime = new Date();
        values.forEach((value, index) => {
            const time = new Date(startTime.getTime() + index * 3600000); // each hour
            generatedData.push({ time, value });
        });
        return generatedData;
    };

    const updateGraphs = () => {
        const numPoints = $('#numPoints').val();
        const minTemp = $('#minTemp').val();
        const maxTemp = $('#maxTemp').val();

        data = generateData(numPoints, minTemp, maxTemp);
        originalChart = plotGraph(data, 'originalChart', 'Original Data', originalChart, true);
    };

    $('#generate').click(updateGraphs);

    $('#loadCsvData').click(() => {
        const csvData = prompt("Please enter CSV data (comma-separated values):");
        if (csvData) {
            data = loadCsvData(csvData);
            originalChart = plotGraph(data, 'originalChart', 'Original Data', originalChart, true);
        }
    });

    // Load default data on first load
    data = loadDefaultData();
    originalChart = plotGraph(data, 'originalChart', 'Original Data', originalChart, true);

    $('#execute').click(() => {
        const minFreq = $('#minFreq').val();
        const maxChange = $('#maxChange').val();
        const compressedData = compressData(data, maxChange, minFreq);
        compressedChart = plotGraph(compressedData, 'compressedChart', 'Compressed Data', compressedChart);
    });
});
