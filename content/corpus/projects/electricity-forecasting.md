# Electricity Production Forecasting

## What is the Electricity Production Forecasting project?
It forecasts 33 years of monthly US utility production from the FRED IPG2211A2N series, 397 monthly observations. [README:electricity_consumption_forecasting]
It compares SARIMA, Holt-Winters, and a seasonal-naive baseline under 5-fold walk-forward backtesting. [README:electricity_consumption_forecasting]

## What are the measured results of the forecasting project?
SARIMA was the best model at MASE 0.959, beating the seasonal-naive baseline by only about 4 percent. [README:electricity_consumption_forecasting]
Holt-Winters scored MASE 1.308, losing to the naive baseline outright despite a respectable-looking 3.5 percent MAPE. [README:electricity_consumption_forecasting]

## Why keep a naive baseline in the results?
Without a baseline in the table you cannot tell whether a model earns its complexity. [README:electricity_consumption_forecasting]
The small SARIMA margin and the Holt-Winters loss are both only legible because the baseline sits right next to them. [README:electricity_consumption_forecasting]

## Why is there no accuracy metric in the forecasting project?
Accuracy is deliberately absent because it is a classification metric and is meaningless on a continuous series. [README:electricity_consumption_forecasting]

## What bug did the validation layer catch?
During the rebuild the validation layer caught that the source CSV is month-first, and parsing it day-first produced a clean-looking series spaced one day apart that would have silently corrupted every seasonal model. [README:electricity_consumption_forecasting]

## What is the stack for the forecasting project, and where is it?
It is built in Python with statsmodels, Streamlit, and Plotly, with 53 tests and CI on Python 3.10 and 3.12. [README:electricity_consumption_forecasting]
The code is at github.com/sahil7359/electricity_consumption_forecasting and a live demo is at elecforecast.streamlit.app. [README:electricity_consumption_forecasting]
