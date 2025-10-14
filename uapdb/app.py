import pandas as pd
import numpy as np
import plotly.express as px
from textblob import TextBlob
from sklearn.feature_extraction.text import CountVectorizer
import dash
from dash import dcc, html, dash_table
from dash.dependencies import Input, Output
import logging

logging.basicConfig(level='INFO')

# Data loading and preprocessing
df = pd.read_csv("updb.csv").dropna(subset=['latitude', 'longitude', 'country', 'Year', 'description'])
df['Year'] = pd.to_numeric(df['Year'], errors='coerce').dropna()
df['description'] = df['description'].astype(str)

# NLP computations
df[['sentiment', 'subjectivity']] = df['description'].apply(lambda x: pd.Series(TextBlob(x).sentiment))
df['mentions'] = df['description'].apply(lambda x: len(str(x).split()))
df['impact'] = np.log(df['mentions'] + 1)
df['veracity'] = np.log(df['mentions'] + 1) * df['sentiment'].abs()
df['image_score'] = (df['sentiment'].abs() + df['subjectivity']) * df['veracity']
df['Analysis_Category'] = np.where(df['subjectivity'] < 0.5, 'Scientific', 'Emotional')
df['short_description'] = df['description'].str[:100] + '...'

# Keywords extraction
keywords = ['craft', 'alien', 'ufo', 'object', 'disk', 'orb', 'triangle', 'hover', 'saucer', 'cigar', 'sphere', 'entity']
vectorizer = CountVectorizer(vocabulary=keywords, binary=True)
keywords_df = pd.DataFrame(vectorizer.fit_transform(df['description'].str.lower()).toarray(), columns=[f'kw_{kw}' for kw in keywords])

# Merge DataFrames clearly
final_df = pd.concat([df.reset_index(drop=True), keywords_df], axis=1)

# Dash application definition
app = dash.Dash(__name__, title="Scientific UAP Dashboard")

app.layout = dash.html.Div([
    html.H1("Scientific UAP Observations Dashboard", style={'textAlign': 'center'}),
    dcc.Dropdown(id='country-filter', options=[{'label': c, 'value': c} for c in sorted(final_df['country'].unique())],
                 placeholder="Filter by country", multi=True, style={'marginBottom': '20px'}),
    dcc.RangeSlider(id='year-filter', min=int(final_df['Year'].min()), max=int(final_df['Year'].max()),
                    marks={str(y): str(y) for y in range(int(final_df['Year'].min()), int(final_df['Year'].max())+1,10)},
                    step=1, value=[int(final_df['Year'].min()), int(final_df['Year'].max())],
                    tooltip={"placement": "bottom", "always_visible": True}, updatemode='drag'),

    dcc.Graph(id='geo-map', style={'height': '600px'}),
    html.Div([
        dcc.Graph(id='yearly-trend'),
        dcc.Graph(id='hyperspectral-analysis'),
        dcc.Graph(id='battlespace-awareness')
    ], style={'display': 'grid', 'gridTemplateColumns': '1fr 1fr 1fr', 'gap': '15px'}),

    dash_table.DataTable(
        id='data-table',
        columns=[{"name": col.replace('_', ' ').capitalize(), "id": col} for col in final_df.columns],
        data=final_df.to_dict('records'), page_size=10,
        filter_action="native", sort_action="native",
        style_table={'overflowX': 'auto'}, style_header={'backgroundColor': '#CCE3DE'}
    )
])

# Callbacks optimized and accurate
@app.callback(
    [Output('geo-map', 'figure'), Output('yearly-trend', 'figure'),
     Output('hyperspectral-analysis', 'figure'), Output('battlespace-awareness', 'figure')],
    [Input('country-filter', 'value'), Input('year-filter', 'value')]
)
def update_charts(countries, years):
    dff = final_df[final_df['Year'].between(years[0], years[1])]
    if countries:
        dff = dff[dff['country'].isin(countries)]

    geo_fig = px.scatter_geo(dff, lat='latitude', lon='longitude', hover_name='city',
                             hover_data=['short_description', 'Year', 'Analysis_Category'],
                             color='Analysis_Category', size='veracity', projection="orthographic")

    trend_fig = px.line(dff.groupby('Year').size().reset_index(name='Observations'),
                        x='Year', y='Observations', markers=True, title='Yearly Trends')

    hyper_fig = px.scatter(dff, x='sentiment', y='subjectivity', size='veracity', color='Analysis_Category',
                           title="Scientific vs Emotional Analysis")

    battle_fig = px.density_mapbox(dff, lat='latitude', lon='longitude', z='image_score', radius=20,
                                   center=dict(lat=dff['latitude'].mean(), lon=dff['longitude'].mean()),
                                   zoom=1, mapbox_style='stamen-terrain')

    return geo_fig, trend_fig, hyper_fig, battle_fig

if __name__ == '__main__':
    app.run_server(debug=False)
