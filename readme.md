##ctipe-model

A 3d model of the CTIPE TOTAL ELECTRON CONTENT FORECAST by NOAA and the NWS

[OPEN](https:scottandrecampbell.com/static/ctipe) ctipe-model
<font size=2 color=gray>(https:scottandrecampbell.com/static/ctipe)</font>

<a href="https:scottandrecampbell.com/static/ctipe">
<img src="https://scottandrecampbell.com/wp-content/uploads/2023/03/Screen-Shot-2023-03-09-at-15.31.12.png" width="100%">
</a>

dataset from [ www.swpc.noaa.gov](https://www.swpc.noaa.gov/products/ctipe-total-electron-content-forecast)

here's a quote:

> The plot illustrates the height integrated electron density (TECU, 1 TECU = 1.e16 electrons/square meter) also called Vertical Total Electron Content (VTEC), vs latitude (-90 to 90 deg) and longitude (0 - 360 deg) from the Coupled Thermosphere Ionosphere Plasmasphere Electrodynamics Model (CTIPe). CTIPe is a state of the art research tool used at the Space Weather Prediction Center to study thermosphere-ionosphere phenomena in order to develop nowcasting and forecasting algorithms for space weather. The objectives are to understand and quantify the importance of the upper-atmospheric mechanisms that affect human activities and to develop new monitoring and predicting techniques.


This model intends to show the "charge" in the ionosphere. Color values are exaggerated by the Y-axis in the model. The timeseries ends with now and starts 4 days ago at 10 minute intervals. To store the timeseries, a small python app was created ("ctipe" [sourcecode at github](https://github.com/luminome/ctipe)) (currently on railway) and its api shares specific time requests to the app (node). 

This required some pretty exhaustive mental notes.
Familiarity with this dataset comes from experience: it was a key-component of the [THREADING EXPOSITION](https:scottandrecampbell.com/threading-exposition-at-soapbox-arts).
