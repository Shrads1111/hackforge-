import pandas as pd
import re
import string
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from lightgbm import LGBMClassifier

def clean_text(text):
    text = text.lower()
    text = re.sub(r'\[.*?\]', '', text)
    text = re.sub(r'\\W', ' ', text)
    text = re.sub(r'https?://\S+|www\.\S+', '', text)
    text = re.sub(r'<.*?>+', '', text)
    text = re.sub(r'[%s]' % re.escape(string.punctuation), '', text)
    text = re.sub(r'\n', '', text)
    text = re.sub(r'\w*\d\w*', '', text)
    return text

# Load data
df_fake = pd.read_csv("Model\Fake.csv")
df_true = pd.read_csv("Model\True.csv")

df_fake["class"] = 0
df_true["class"] = 1

df = pd.concat([df_fake, df_true])
df = df.drop(columns=["title", "subject", "date"])
df["text"] = df["text"].apply(clean_text)

x = df["text"]
y = df["class"]

x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.25)

vectorizer = TfidfVectorizer()
xv_train = vectorizer.fit_transform(x_train)  # ✅ FIT is here
xv_test = vectorizer.transform(x_test)

lr_model = LogisticRegression()
lr_model.fit(xv_train, y_train)

lgbm_model = LGBMClassifier()
lgbm_model.fit(xv_train, y_train)

# ✅ Save fully trained models
joblib.dump(vectorizer, "vectorizer.pkl")
joblib.dump(lr_model, "model_lr.pkl")
joblib.dump(lgbm_model, "model_lgbm.pkl")

print("✅ All models and vectorizer saved after fitting.")