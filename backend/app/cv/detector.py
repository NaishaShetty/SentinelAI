from ultralytics import YOLO

model = YOLO("yolov8n.pt")

def detect_people(frame):
    results = model(frame, conf=0.4, classes=[0])  # class 0 = person
    detections = []

    for r in results:
        for box in r.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])
            detections.append((x1, y1, x2, y2))

    return detections
