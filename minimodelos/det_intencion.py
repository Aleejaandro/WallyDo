# minimodelos/det_intencion.py

import torch
import json
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Ruta absoluta al modelo
MODEL_PATH = Path(__file__).resolve().parent.parent / "minimodelos" / "modelo_intencion_entrenado"
ID2INTENT_PATH = MODEL_PATH / "id2intencion.json"

# Cargar tokenizer y modelo
tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH))
model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_PATH))

# Cargar diccionario id2intent
with open(ID2INTENT_PATH, "r", encoding="utf-8") as f:
    id2intent = json.load(f)
    id2intent = {int(k): v for k, v in id2intent.items()}  # Asegura que las claves sean int

def detectar_intencion(frase: str) -> str:
    """
    Predice la intención de una frase usando el modelo entrenado.
    """
    inputs = tokenizer(frase, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(model.device) for k, v in inputs.items()}
    model.eval()
    with torch.no_grad():
        logits = model(**inputs).logits
    pred_id = torch.argmax(logits, dim=-1).item()
    return id2intent.get(pred_id, "desconocido")
