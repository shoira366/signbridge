import cv2
import torch
from torchvision import models, transforms
from torch import nn
from PIL import Image
import json
import mediapipe as mp
from collections import deque, Counter

IMAGE_SIZE = 128
DEVICE = torch.device("cpu")

MODEL_PATH = "models/best_mobilenetv2_custom_10.pth"
CLASS_MAP_PATH = "models/class_to_idx_custom_10.json"

PRED_BUFFER_SIZE = 10
pred_buffer = deque(maxlen=PRED_BUFFER_SIZE)


def load_classes():
    with open(CLASS_MAP_PATH) as f:
        class_to_idx = json.load(f)
    idx_to_class = {v: k for k, v in class_to_idx.items()}
    return [idx_to_class[i] for i in range(len(idx_to_class))]


def load_model(num_classes):
    model = models.mobilenet_v2(weights=None)
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model


transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils


def get_hand_bbox(hand_landmarks, w, h):
    xs = [lm.x for lm in hand_landmarks.landmark]
    ys = [lm.y for lm in hand_landmarks.landmark]

    x1 = int(min(xs) * w)
    x2 = int(max(xs) * w)
    y1 = int(min(ys) * h)
    y2 = int(max(ys) * h)

    pad = 30
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


def get_stable_prediction():
    valid = [p for p in pred_buffer if p != "..."]
    if not valid:
        return "Uncertain"
    return Counter(valid).most_common(1)[0][0]


def main():
    classes = load_classes()
    model = load_model(len(classes))

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

            label = "No hand detected"

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

                if hand_crop.size != 0:
                    pil_img = Image.fromarray(cv2.cvtColor(hand_crop, cv2.COLOR_BGR2RGB))
                    tensor = transform(pil_img).unsqueeze(0).to(DEVICE)

                    with torch.no_grad():
                        output = model(tensor)
                        probs = torch.softmax(output, dim=1)
                        conf, pred = torch.max(probs, 1)

                    confidence = conf.item()
                    pred_label = classes[pred.item()]

                    if confidence > 0.60:
                        pred_buffer.append(pred_label)
                    else:
                        pred_buffer.append("...")

                    stable_label = get_stable_prediction()
                    label = f"{stable_label} ({confidence:.2f})"

                    preview = cv2.resize(hand_crop, (220, 220))
                    cv2.imshow("Hand Crop", preview)

            cv2.putText(
                display_frame,
                label,
                (20, 40),
                cv2.FONT_HERSHEY_SIMPLEX,
                1,
                (0, 255, 0),
                2,
            )

            cv2.imshow("Custom A-J Recognition", display_frame)

            key = cv2.waitKey(1) & 0xFF
            if key == 27 or key == ord("q"):
                break

    cap.release()
    cv2.destroyAllWindows()


if __name__ == "__main__":
    main()