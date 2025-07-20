from flask import Flask, request, jsonify
import joblib
import pandas as pd
import re
import string

app = Flask(__name__)

# Load saved models and vectorizer
vectorizer = joblib.load("vectorizer.pkl")
model_lr = joblib.load("model_lr.pkl")
model_lgbm = joblib.load("model_lgbm.pkl")

# Bias keywords (example only — expand as needed)
left_keywords = ["climate change", "social justice", "equality", "diversity", "welfare"]
right_keywords = ["tax cut", "immigration", "gun rights", "patriot", "military"]

# Text preprocessing function
def clean_text(text):
    text = text.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r"\\W", " ", text)
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'<.*?>+', '', text)
    text = re.sub('[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub(r'\n', '', text)
    text = re.sub(r'\w*\d\w*', '', text)
    return text

def output_label(n):
    return "Fake News" if n == 0 else "Not A Fake News"

def detect_bias(text):
    for word in left_keywords:
        if word in text:
            return "Liberal Bias"
    for word in right_keywords:
        if word in text:
            return "Conservative Bias"
    return "Neutral"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    news_text = data.get("text", "")

    if not news_text:
        return jsonify({"error": "No text provided"}), 400

    clean = clean_text(news_text)
    vector_input = vectorizer.transform([clean])

    # Class predictions
    pred_lr = model_lr.predict(vector_input)[0]
    pred_lgbm = model_lgbm.predict(vector_input)[0]

    # Veracity from LGBM's probability
    prob_real = model_lgbm.predict_proba(vector_input)[0][1]  # Probability for class 1 (real)

    if prob_real >= 0.85:
        veracity = "Real"
    elif prob_real >= 0.4:
        veracity = "Mixed"
    else:
        veracity = "Fake"

    # Bias detection
    bias = detect_bias(clean)

    return jsonify({
        "logistic_regression": output_label(pred_lr),
        "lightgbm": output_label(pred_lgbm),
        "veracity": veracity,
        "bias_level": bias
    })


@app.route('/', methods=['GET'])
def home():
    return "Fake News Detection API is running!"

if __name__ == '__main__':
    app.run(debug=True)