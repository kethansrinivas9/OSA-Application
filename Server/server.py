from flask import Flask,request
from flask_cors import CORS, cross_origin
import os
import requests
import json

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
base_url = 'http://flaskosa.herokuapp.com/cmd/'


@app.route('/query', methods = ['GET'])
@cross_origin()
def query():
    name = request.args.get('queryInput')
    if name == "cmd":
        query_url = base_url
    else:
        query_url = base_url + name
    return requests.get(query_url).content


@app.route('/control', methods = ['GET'])
@cross_origin()
def control():
    name = request.args.get('queryInput')
    query_url = base_url + name
    return requests.get(query_url).content


@app.route('/TRACE', methods = ['GET'])
@cross_origin()
def trace():
    query_url = base_url + "TRACE"
    data = requests.get(query_url).content
    jsonData = json.loads(data)
    return jsonData


@app.route('/hello', methods = ['GET'])
@cross_origin()
def hello():
    return "hello"


if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
