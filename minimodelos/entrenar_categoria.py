# entrenar_categoria.py

import json
import numpy as np
import torch
import logging
import os
import shutil
from torch.utils.data import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("minimodelos/log_entrenamiento_categoria.txt"),
        logging.StreamHandler()
    ]
)

# 1. Cargar dataset
def cargar_dataset(json_path):
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)
    textos = [item["text"] for item in data if "text" in item and "categoria" in item]
    categorias = [item["categoria"] for item in data if "text" in item and "categoria" in item]
    return textos, categorias

# 2. Procesar
textos, categorias = cargar_dataset("minimodelos/dataset_categoria.json")
categorias_unicas = sorted(list(set(categorias)))
cat2id = {cat: i for i, cat in enumerate(categorias_unicas)}
id2cat = {i: cat for cat, i in cat2id.items()}
labels = [cat2id[c] for c in categorias]

# 3. Split
train_texts, val_texts, train_labels, val_labels = train_test_split(
    textos, labels, test_size=0.2, random_state=42
)

# 4. Dataset personalizado
class CategoriaDataset(Dataset):
    def __init__(self, textos, labels, tokenizer, max_len=128):
        self.encodings = tokenizer(textos, truncation=True, padding=True, max_length=max_len)
        self.labels = labels
    def __len__(self):
        return len(self.labels)
    def __getitem__(self, idx):
        item = {k: torch.tensor(v[idx]) for k, v in self.encodings.items()}
        item["labels"] = torch.tensor(self.labels[idx])
        return item

# 5. Tokenizador y modelo
model_name = "PlanTL-GOB-ES/roberta-base-bne"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=len(cat2id))

# 6. Preparar datasets
train_dataset = CategoriaDataset(train_texts, train_labels, tokenizer)
val_dataset = CategoriaDataset(val_texts, val_labels, tokenizer)

# 7. Métricas
def compute_metrics(pred):
    labels = pred.label_ids
    preds = np.argmax(pred.predictions, axis=1)
    acc = accuracy_score(labels, preds)
    report = classification_report(labels, preds, target_names=categorias_unicas, output_dict=True, zero_division=0)
    matrix = confusion_matrix(labels, preds)
    return {
        "accuracy": acc,
        "f1_macro": report["macro avg"]["f1-score"],
        "report": report,
        "confusion_matrix": matrix.tolist()
    }

# 8. Entrenamiento
output_dir = "./minimodelos/modelo_categoria_entrenado"

training_args = TrainingArguments(
    output_dir=output_dir,
    evaluation_strategy="epoch",
    save_strategy="epoch",
    learning_rate=2e-5,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=4,
    weight_decay=0.01,
    logging_dir="./logs",
    load_best_model_at_end=True,
    metric_for_best_model="accuracy"
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    tokenizer=tokenizer,
    compute_metrics=compute_metrics
)

# 9. Entrenar
logging.info("Entrenando modelo de clasificación de categoría...")
trainer.train()
trainer.evaluate()

# 10. Guardar modelo y tokenizer finales
model.save_pretrained(output_dir)
tokenizer.save_pretrained(output_dir)
logging.info(f"Modelo y tokenizer guardados en: {output_dir}")

# 11. Eliminar checkpoints intermedios
checkpoints = [d for d in os.listdir(output_dir) if d.startswith("checkpoint-")]
for chk in checkpoints:
    shutil.rmtree(os.path.join(output_dir, chk))
logging.info(" Checkpoints eliminados. Solo se mantiene el modelo final.")

# Para continuar entrenando en el futuro,  NO eliminar los checkpoints.
# Alternativamente, cargar el modelo entrenado y reentrenar desde ahí.