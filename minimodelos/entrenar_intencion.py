# entrenar_intencion.py
from transformers import AutoTokenizer, AutoModelForSequenceClassification, TrainingArguments, Trainer
from datasets import Dataset
import json
import torch
from transformers import DataCollatorWithPadding

# 1. Cargar el dataset
with open("./minimodelos/dataset_intenciones.json", "r", encoding="utf-8") as f:
    data = json.load(f)

texts = [example["text"] for example in data]
raw_labels = [example["intent"] for example in data]

# 2. Mapear intenciones a IDs
intencion2id = {intent: i for i, intent in enumerate(sorted(set(raw_labels)))}
id2intencion = {i: intent for intent, i in intencion2id.items()}
labels = [intencion2id[l] for l in raw_labels]

# 3. Crear dataset HuggingFace
dataset = Dataset.from_dict({"text": texts})
dataset = dataset.add_column("labels", labels)

# 4. Tokenizador y modelo base
model_name = "distilbert-base-uncased"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=len(intencion2id))

# 5. Tokenización
def tokenize_function(examples):
    return tokenizer(examples["text"], padding=True, truncation=True)

tokenized_dataset = dataset.map(tokenize_function, batched=True)

# 6. Data collator
data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

# 7. Argumentos de entrenamiento
training_args = TrainingArguments(
    output_dir="./minimodelos/modelo_intencion_entrenado",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    num_train_epochs=3,
    logging_steps=10,
    save_total_limit=2,
    load_best_model_at_end=True
)

# 8. Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_dataset,
    eval_dataset=tokenized_dataset,
    tokenizer=tokenizer,
    data_collator=data_collator
)

# 9. Entrenamiento
print("Entrenando modelo de intención...")
trainer.train()
trainer.evaluate()

# 10. Guardar tokenizer y mapeo de intenciones
model.save_pretrained(training_args.output_dir)
tokenizer.save_pretrained(training_args.output_dir)
with open(f"{training_args.output_dir}/id2intencion.json", "w", encoding="utf-8") as f:
    json.dump(id2intencion, f, ensure_ascii=False, indent=2)

print("Entrenamiento y guardado completados.")
