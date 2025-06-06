# det_categoria.py
import torch
from pathlib import Path
from transformers import AutoTokenizer, AutoModelForSequenceClassification

# Construye la ruta absoluta al modelo local
MODEL_PATH = Path(__file__).resolve().parent / "modelo_categoria_entrenado"

# Cargar tokenizer y modelo
tokenizer = AutoTokenizer.from_pretrained(str(MODEL_PATH))
model = AutoModelForSequenceClassification.from_pretrained(str(MODEL_PATH))

# Mapear índice a categoría
id2cat = {
    0: "Deporte",
    1: "Estudio",
    2: "Personal",
    3: "Salud",
    4: "Trabajo"
}

def predecir_categoria(texto):
    """
    Predice la categoría de una frase usando el modelo ya entrenado.
    """
    inputs = tokenizer(texto, return_tensors="pt", truncation=True, padding=True, max_length=128)
    inputs = {k: v.to(model.device) for k, v in inputs.items()}
    model.eval()
    with torch.no_grad():
        logits = model(**inputs).logits
    pred_id = torch.argmax(logits, dim=-1).item()
    return id2cat[pred_id]
