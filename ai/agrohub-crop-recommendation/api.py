from fastapi import FastAPI
import numpy as np
import tensorflow as tf
import joblib
import pandas as pd

from crop_input import CropInput

app = FastAPI()

model = tf.keras.models.load_model('crop_recommendation_model.keras')

ct = joblib.load('column_transformer.joblib')
le = joblib.load('label_encoder.joblib')
last_crop_categories = joblib.load('last_crop_categories.joblib')


@app.post("/predict")
def predict_crop(data: CropInput):
    input_df = pd.DataFrame([{
        "duration_months": data.duration_months,
        "N": data.N,
        "P": data.P,
        "K": data.K,
        "temperature": data.temperature,
        "humidity": data.humidity,
        "pH": data.ph,
        "rainfall": data.rainfall,
        "last_crop_duration": data.last_crop_duration,
        "last_crop": data.last_crop,
    }])

    input_df = pd.get_dummies(input_df, columns=['last_crop'])

    for col in last_crop_categories:
        if col not in input_df.columns:
            input_df[col] = 0

    input_df = input_df.reindex(columns=ct.feature_names_in_, fill_value=0)

    input_scaled = ct.transform(input_df)

    pred_probs = model.predict(input_scaled)[0]

    top_idx = np.argsort(pred_probs)[-3:][::-1]
    top_crops = le.inverse_transform(top_idx).tolist()
    top_probs = pred_probs[top_idx].tolist()

    return {"top_crops": top_crops, "top_probs": top_probs}
