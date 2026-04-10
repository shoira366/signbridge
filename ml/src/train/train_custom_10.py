from pathlib import Path
import copy
import json
import time

import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from torchvision import datasets, models, transforms


def main():
    DATA_ROOT = Path("data/custom_asl_split_10")
    MODEL_DIR = Path("models")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    IMAGE_SIZE = 128
    BATCH_SIZE = 8
    NUM_WORKERS = 0
    NUM_EPOCHS = 5
    LEARNING_RATE = 1e-3
    DEVICE = torch.device("cpu")

    TRAIN_DIR = DATA_ROOT / "train"
    VAL_DIR = DATA_ROOT / "val"
    TEST_DIR = DATA_ROOT / "test"

    train_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.RandomRotation(degrees=10),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    eval_transform = transforms.Compose([
        transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225]),
    ])

    train_dataset = datasets.ImageFolder(TRAIN_DIR, transform=train_transform)
    val_dataset = datasets.ImageFolder(VAL_DIR, transform=eval_transform)
    test_dataset = datasets.ImageFolder(TEST_DIR, transform=eval_transform)

    class_names = train_dataset.classes
    num_classes = len(class_names)

    if num_classes == 0:
        raise ValueError("No classes found in training folder.")

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True,
        num_workers=NUM_WORKERS,
    )
    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
    )
    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False,
        num_workers=NUM_WORKERS,
    )

    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.DEFAULT)
    in_features = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(in_features, num_classes)
    model = model.to(DEVICE)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)

    def run_epoch(loader, training=False):
        if training:
            model.train()
        else:
            model.eval()

        running_loss = 0.0
        running_correct = 0
        total = 0

        for batch_idx, (images, labels) in enumerate(loader, start=1):
            images = images.to(DEVICE)
            labels = labels.to(DEVICE)

            if training:
                optimizer.zero_grad()

            with torch.set_grad_enabled(training):
                outputs = model(images)
                loss = criterion(outputs, labels)
                _, preds = torch.max(outputs, 1)

                if training:
                    loss.backward()
                    optimizer.step()

            batch_size_now = labels.size(0)
            running_loss += loss.item() * batch_size_now
            running_correct += (preds == labels).sum().item()
            total += batch_size_now

            if batch_idx % 20 == 0 or batch_idx == len(loader):
                phase = "Train" if training else "Val/Test"
                print(f"{phase} batch {batch_idx}/{len(loader)} | loss={loss.item():.4f}", flush=True)

        return running_loss / total, running_correct / total

    class_map_path = MODEL_DIR / "class_to_idx_custom_10.json"
    with open(class_map_path, "w") as f:
        json.dump(train_dataset.class_to_idx, f, indent=2)

    print(f"Device: {DEVICE}")
    print(f"Classes ({num_classes}): {class_names}")
    print(f"Train size: {len(train_dataset)}")
    print(f"Val size: {len(val_dataset)}")
    print(f"Test size: {len(test_dataset)}")

    best_val_acc = 0.0
    best_model_wts = copy.deepcopy(model.state_dict())
    history = []

    start_time = time.time()

    for epoch in range(NUM_EPOCHS):
        print(f"\nEpoch {epoch + 1}/{NUM_EPOCHS}", flush=True)

        train_loss, train_acc = run_epoch(train_loader, training=True)
        val_loss, val_acc = run_epoch(val_loader, training=False)

        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.4f}")
        print(f"Val   Loss: {val_loss:.4f} | Val   Acc: {val_acc:.4f}")

        history.append({
            "epoch": epoch + 1,
            "train_loss": train_loss,
            "train_acc": train_acc,
            "val_loss": val_loss,
            "val_acc": val_acc,
        })

        if val_acc > best_val_acc:
            best_val_acc = val_acc
            best_model_wts = copy.deepcopy(model.state_dict())
            torch.save(best_model_wts, MODEL_DIR / "best_mobilenetv2_custom_10.pth")
            print(f"Saved new best model with val acc: {best_val_acc:.4f}")

    elapsed = time.time() - start_time
    print(f"\nTraining finished in {elapsed / 60:.2f} minutes.")
    print(f"Best validation accuracy: {best_val_acc:.4f}")

    model.load_state_dict(best_model_wts)
    test_loss, test_acc = run_epoch(test_loader, training=False)
    print(f"Test Loss: {test_loss:.4f} | Test Acc: {test_acc:.4f}")

    history_path = MODEL_DIR / "training_history_custom_10.json"
    with open(history_path, "w") as f:
        json.dump(history, f, indent=2)

    print(f"Saved training history to: {history_path}")


if __name__ == "__main__":
    main()