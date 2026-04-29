from pathlib import Path
import random
import shutil

SEED = 42
TRAIN_RATIO = 0.7
VAL_RATIO = 0.15
TEST_RATIO = 0.15

random.seed(SEED)

source_root = Path("data/custom_asl_raw")
target_root = Path("data/custom_asl_split_10")

allowed_classes = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", 
                   "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]

assert source_root.exists(), f"Missing source folder: {source_root}"
assert abs(TRAIN_RATIO + VAL_RATIO + TEST_RATIO - 1.0) < 1e-9

for split in ["train", "val", "test"]:
    (target_root / split).mkdir(parents=True, exist_ok=True)

for class_name in allowed_classes:
    class_dir = source_root / class_name
    if not class_dir.exists():
        print(f"Skipping missing class folder: {class_name}")
        continue

    images = [p for p in class_dir.iterdir() if p.is_file()]
    if len(images) == 0:
        print(f"Skipping empty class folder: {class_name}")
        continue

    random.shuffle(images)

    total = len(images)
    train_end = int(total * TRAIN_RATIO)
    val_end = train_end + int(total * VAL_RATIO)

    split_map = {
        "train": images[:train_end],
        "val": images[train_end:val_end],
        "test": images[val_end:],
    }

    for split_name, split_images in split_map.items():
        split_class_dir = target_root / split_name / class_name
        split_class_dir.mkdir(parents=True, exist_ok=True)

        for img_path in split_images:
            shutil.copy2(img_path, split_class_dir / img_path.name)

print("Done splitting custom 10-class dataset.")

for split in ["train", "val", "test"]:
    print(f"\n{split.upper()}")
    split_path = target_root / split
    total_files = 0
    for class_dir in sorted(split_path.iterdir()):
        if class_dir.is_dir():
            count = len([p for p in class_dir.iterdir() if p.is_file()])
            total_files += count
            print(f"{class_dir.name}: {count}")
    print(f"Total: {total_files}")