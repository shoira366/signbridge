# import base64
# import json
# from collections import Counter, deque
# from io import BytesIO

# import cv2
# import mediapipe as mp
# import numpy as np
# import torch
# from PIL import Image
# from torch import nn
# from torchvision import models, transforms

# IMAGE_SIZE = 128
# DEVICE = torch.device("cpu")

# MODEL_PATH = "models/best_mobilenetv2_custom_10.pth"
# CLASS_MAP_PATH = "models/class_to_idx_custom_10.json"

# PRED_BUFFER_SIZE = 10
# pred_buffer = deque(maxlen=PRED_BUFFER_SIZE)

# transform = transforms.Compose([
#     transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
#     transforms.ToTensor(),
#     transforms.Normalize([0.485, 0.456, 0.406],
#                          [0.229, 0.224, 0.225]),
# ])

# mp_hands = mp.solutions.hands


# def load_classes():
#     with open(CLASS_MAP_PATH) as f:
#         class_to_idx = json.load(f)
#     idx_to_class = {v: k for k, v in class_to_idx.items()}
#     return [idx_to_class[i] for i in range(len(idx_to_class))]


# def load_model(num_classes):
#     model = models.mobilenet_v2(weights=None)
#     model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
#     model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
#     model.to(DEVICE)
#     model.eval()
#     return model


# classes = load_classes()
# model = load_model(len(classes))
# hands = mp_hands.Hands(
#     static_image_mode=False,
#     max_num_hands=1,
#     min_detection_confidence=0.5,
#     min_tracking_confidence=0.5,
# )


# def get_hand_bbox(hand_landmarks, w, h):
#     xs = [lm.x for lm in hand_landmarks.landmark]
#     ys = [lm.y for lm in hand_landmarks.landmark]

#     x1 = int(min(xs) * w)
#     x2 = int(max(xs) * w)
#     y1 = int(min(ys) * h)
#     y2 = int(max(ys) * h)

#     pad = 30
#     x1 = max(0, x1 - pad)
#     y1 = max(0, y1 - pad)
#     x2 = min(w, x2 + pad)
#     y2 = min(h, y2 + pad)

#     return x1, y1, x2, y2


# def make_square_crop(x1, y1, x2, y2, w, h):
#     box_w = x2 - x1
#     box_h = y2 - y1
#     size = max(box_w, box_h)

#     cx = x1 + box_w // 2
#     cy = y1 + box_h // 2

#     x1 = max(0, cx - size // 2)
#     y1 = max(0, cy - size // 2)
#     x2 = min(w, cx + size // 2)
#     y2 = min(h, cy + size // 2)

#     return x1, y1, x2, y2


# def get_stable_prediction():
#     valid = [p for p in pred_buffer if p != "..."]
#     if not valid:
#         return "Uncertain"
#     return Counter(valid).most_common(1)[0][0]


# def decode_base64_image(data_url: str):
#     if "," in data_url:
#         _, encoded = data_url.split(",", 1)
#     else:
#         encoded = data_url

#     image_data = base64.b64decode(encoded)
#     pil_img = Image.open(BytesIO(image_data)).convert("RGB")
#     return np.array(pil_img)


# def predict_from_frame(frame_rgb: np.ndarray):
#     h, w, _ = frame_rgb.shape
#     results = hands.process(frame_rgb)

#     if not results.multi_hand_landmarks:
#         pred_buffer.append("...")
#         return {
#             "label": "No hand detected",
#             "stable_label": get_stable_prediction(),
#             "confidence": 0.0,
#             "hand_detected": False,
#         }

#     hand_landmarks = results.multi_hand_landmarks[0]
#     x1, y1, x2, y2 = get_hand_bbox(hand_landmarks, w, h)
#     x1, y1, x2, y2 = make_square_crop(x1, y1, x2, y2, w, h)

#     hand_crop = frame_rgb[y1:y2, x1:x2]

#     if hand_crop.size == 0:
#         pred_buffer.append("...")
#         return {
#             "label": "Invalid crop",
#             "stable_label": get_stable_prediction(),
#             "confidence": 0.0,
#             "hand_detected": True,
#         }

#     pil_img = Image.fromarray(hand_crop)
#     tensor = transform(pil_img).unsqueeze(0).to(DEVICE)

#     with torch.no_grad():
#         output = model(tensor)
#         probs = torch.softmax(output, dim=1)
#         conf, pred = torch.max(probs, 1)

#     confidence = conf.item()
#     pred_label = classes[pred.item()]

#     if confidence > 0.60:
#         pred_buffer.append(pred_label)
#     else:
#         pred_buffer.append("...")

#     stable_label = get_stable_prediction()

#     return {
#         "label": pred_label,
#         "stable_label": stable_label,
#         "confidence": confidence,
#         "hand_detected": True,
#     }

import base64
import json
from collections import Counter, deque
from io import BytesIO

import cv2
import mediapipe as mp
import numpy as np
import torch
from PIL import Image
from torch import nn
from torchvision import models, transforms

IMAGE_SIZE = 128
DEVICE = torch.device("cpu")

MODEL_PATH = "models/best_mobilenetv2_custom_10.pth"
CLASS_MAP_PATH = "models/class_to_idx_custom_10.json"

PRED_BUFFER_SIZE = 10
# Store buffers per session (using session_id)
pred_buffers = {}

transform = transforms.Compose([
    transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225]),
])

mp_hands = mp.solutions.hands


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


classes = load_classes()
model = load_model(len(classes))
hands = mp_hands.Hands(
    static_image_mode=False,
    max_num_hands=1,
    min_detection_confidence=0.5,
    min_tracking_confidence=0.5,
)


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


def get_stable_prediction(session_id):
    buffer = pred_buffers.get(session_id, deque(maxlen=PRED_BUFFER_SIZE))
    valid = [p for p in buffer if p != "..."]
    if not valid:
        return "Uncertain"
    return Counter(valid).most_common(1)[0][0]


def decode_base64_image(data_url: str):
    if "," in data_url:
        _, encoded = data_url.split(",", 1)
    else:
        encoded = data_url
    image_data = base64.b64decode(encoded)
    pil_img = Image.open(BytesIO(image_data)).convert("RGB")
    return np.array(pil_img)


def predict_from_frame(frame_rgb: np.ndarray, session_id: str = "default"):
    h, w, _ = frame_rgb.shape
    results = hands.process(frame_rgb)
    
    # Initialize buffer for this session if not exists
    if session_id not in pred_buffers:
        pred_buffers[session_id] = deque(maxlen=PRED_BUFFER_SIZE)
    
    buffer = pred_buffers[session_id]

    if not results.multi_hand_landmarks:
        buffer.append("...")
        stable_label = get_stable_prediction(session_id)
        return {
            "label": "No hand detected",
            "stable_label": stable_label,
            "confidence": 0.0,
            "hand_detected": False,
            "rawLabel": "No hand detected"
        }

    hand_landmarks = results.multi_hand_landmarks[0]
    x1, y1, x2, y2 = get_hand_bbox(hand_landmarks, w, h)
    x1, y1, x2, y2 = make_square_crop(x1, y1, x2, y2, w, h)

    hand_crop = frame_rgb[y1:y2, x1:x2]

    if hand_crop.size == 0:
        buffer.append("...")
        stable_label = get_stable_prediction(session_id)
        return {
            "label": "Invalid crop",
            "stable_label": stable_label,
            "confidence": 0.0,
            "hand_detected": True,
            "rawLabel": "Invalid crop"
        }

    pil_img = Image.fromarray(hand_crop)
    tensor = transform(pil_img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        output = model(tensor)
        probs = torch.softmax(output, dim=1)
        conf, pred = torch.max(probs, 1)

    confidence = conf.item()
    pred_label = classes[pred.item()]

    if confidence > 0.60:
        buffer.append(pred_label)
    else:
        buffer.append("...")

    stable_label = get_stable_prediction(session_id)

    return {
        "label": pred_label,
        "stable_label": stable_label,
        "confidence": confidence,
        "hand_detected": True,
        "rawLabel": pred_label
    }