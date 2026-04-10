import cv2
import mediapipe as mp
from pathlib import Path

DATASET_ROOT = Path("data/custom_asl_raw")
CLASSES = ["P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"]
START_CLASS_INDEX = 0
WINDOW_NAME = "Capture Custom Dataset"

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils


def ensure_folders():
    for class_name in CLASSES:
        (DATASET_ROOT / class_name).mkdir(parents=True, exist_ok=True)


def get_next_filename(class_name: str) -> Path:
    class_dir = DATASET_ROOT / class_name
    existing = list(class_dir.glob("*"))
    next_index = len(existing) + 1
    return class_dir / f"{class_name}_{next_index}.png"


def get_hand_bbox(hand_landmarks, w, h, pad=30):
    xs = [lm.x for lm in hand_landmarks.landmark]
    ys = [lm.y for lm in hand_landmarks.landmark]

    x1 = int(min(xs) * w)
    x2 = int(max(xs) * w)
    y1 = int(min(ys) * h)
    y2 = int(max(ys) * h)

    x1 = max(0, x1 - pad)
    y1 = max(0, y1 - pad)
    x2 = min(w, x2 + pad)
    y2 = min(h, y2 + pad)

    return x1, y1, x2, y2


def make_square_crop(x1, y1, x2, y2, w, h):
    box_w = x2 - x1
    box_h = y2 - y1
    size = max(box_w, box_h)

    cx = x1 + box_w // 2
    cy = y1 + box_h // 2

    x1 = max(0, cx - size // 2)
    y1 = max(0, cy - size // 2)
    x2 = min(w, cx + size // 2)
    y2 = min(h, cy + size // 2)

    return x1, y1, x2, y2


def count_images(class_name: str) -> int:
    return len(list((DATASET_ROOT / class_name).glob("*")))


def main():
    ensure_folders()

    class_idx = START_CLASS_INDEX
    current_class = CLASSES[class_idx]

    cap = cv2.VideoCapture(0)

    with mp_hands.Hands(
        static_image_mode=False,
        max_num_hands=1,
        min_detection_confidence=0.5,
        min_tracking_confidence=0.5,
    ) as hands:

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            frame = cv2.flip(frame, 1)
            display_frame = frame.copy()

            h, w, _ = frame.shape
            rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = hands.process(rgb_frame)

            hand_crop = None

            if results.multi_hand_landmarks:
                hand_landmarks = results.multi_hand_landmarks[0]

                mp_drawing.draw_landmarks(
                    display_frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS
                )

                x1, y1, x2, y2 = get_hand_bbox(hand_landmarks, w, h)
                x1, y1, x2, y2 = make_square_crop(x1, y1, x2, y2, w, h)

                cv2.rectangle(display_frame, (x1, y1), (x2, y2), (255, 255, 255), 2)

                hand_crop = frame[y1:y2, x1:x2]

                if hand_crop is not None and hand_crop.size != 0:
                    preview = cv2.resize(hand_crop, (220, 220))
                    cv2.imshow("Hand Crop Preview", preview)

            info_1 = f"Class: {current_class}"
            info_2 = f"Saved: {count_images(current_class)}"
            info_3 = "S=save  N=next  P=prev  Q/ESC=quit"

            cv2.putText(display_frame, info_1, (20, 35),
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            cv2.putText(display_frame, info_2, (20, 75),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 0), 2)
            cv2.putText(display_frame, info_3, (20, 115),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (200, 200, 200), 2)

            cv2.imshow(WINDOW_NAME, display_frame)

            key = cv2.waitKey(1) & 0xFF

            if key == ord("s"):
                if hand_crop is not None and hand_crop.size != 0:
                    save_path = get_next_filename(current_class)
                    cv2.imwrite(str(save_path), hand_crop)
                    print(f"Saved: {save_path}")
                else:
                    print("No valid hand crop to save.")

            elif key == ord("n"):
                class_idx = (class_idx + 1) % len(CLASSES)
                current_class = CLASSES[class_idx]

            elif key == ord("p"):
                class_idx = (class_idx - 1) % len(CLASSES)
                current_class = CLASSES[class_idx]

            elif key == 27 or key == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()