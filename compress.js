const compressData = (data, changeThreshold, minFrequency) => {
    const compressedData = [];
    let lastValue = null;
    let lastTime = null;

    for (let i = 0; i < data.length; i++) {
        const { time, value } = data[i];
        let reason = '';

        if (lastValue === null || lastTime === null) {
            compressedData.push({ time, value, reason: 'Initial Point' });
            lastValue = value;
            lastTime = time;
        } else {
            const change = Math.abs((value - lastValue) / lastValue) * 100;
            const timeDiff = (time - lastTime) / 3600000; // convert to hours

            if (change >= changeThreshold || timeDiff >= (24 / minFrequency)) {
                reason = change >= changeThreshold ? `Change ${change.toFixed(2)}%` : `Time Difference ${timeDiff.toFixed(2)} hours`;
                compressedData.push({ time, value, reason });
                lastValue = value;
                lastTime = time;
            }
        }
    }

    return compressedData;
};
