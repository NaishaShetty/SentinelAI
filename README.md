# SentinelAI

SentinelAI is a real-time, memory-aware computer vision system designed to monitor human behavior and make **safe decisions under uncertainty**.

## 🔍 What It Does
- Detects and tracks people from live camera feeds
- Computes behavioral risk over time
- Maintains per-entity risk memory with temporal decay
- Uses abstention logic to refuse unsafe predictions

## 🧠 Why It’s Different
Most AI systems always predict. SentinelAI is designed to **abstain** when confidence is low, mirroring real safety-critical AI systems.

## 🏗️ Architecture
Camera → Vision Inference → Risk Scoring → Memory → Abstention → Dashboard

## 🛠️ Tech Stack
- YOLOv8, OpenCV
- FastAPI
- React
- Docker

## 🚀 Use Cases
- Smart buildings
- Public safety monitoring
- Workplace safety
- Human-in-the-loop surveillance
