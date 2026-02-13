# SentinelAI 🛡️  
**Real-Time, Memory-Aware Vision System with Abstention**

SentinelAI is a **production-style computer vision system** that monitors human behavior in real time and makes **safety-aware decisions under uncertainty**.  
Instead of forcing predictions, the system is explicitly designed to **abstain and escalate** when confidence is insufficient.

This project focuses on **AI systems engineering**, not just model inference.

---

## Demo Url

-


## ✨ Key Idea

> Most AI systems always predict.  
> **SentinelAI is built to refuse authority when it is unsure.**

This mirrors how real **safety-critical AI systems** (healthcare, surveillance, autonomous systems) are designed.

---

## 🔍 What SentinelAI Does

- Detects and tracks people from **live camera / video streams**
- Extracts behavioral signals (motion, patterns over time)
- Computes **risk incrementally**, not per-frame
- Maintains **per-entity temporal risk memory with decay**
- Makes decisions using **explicit abstention logic**
- Visualizes decisions, risk history, and system health in a dashboard

---

## 🧠 Decision Model

SentinelAI operates with three explicit decision states:

| State | Meaning |
|-----|--------|
| **PROCEED** | Behavior appears normal |
| **WARN** | Elevated risk detected, monitor closely |
| **ABSTAIN / ESCALATE** | Confidence too low — human oversight required |

Abstention is a **feature**, not a failure.

---

## 🏗️ System Architecture

```markdown
```mermaid
flowchart LR
    A[📷 Camera / Stream] --> B[🧠 Vision Inference<br/>(YOLOv8)]
    B --> C[🔍 Multi-Object Tracking]
    C --> D[⚠️ Risk Signal Extraction]
    D --> E[🕒 Temporal Risk Memory<br/>(Decay)]
    E --> F{🛑 Decision Logic}
    F -->|Proceed| G[📊 Dashboard]
    F -->|Warn| G
    F -->|Abstain| H[👤 Human Review]


```
The system is **stateful**, explainable, and designed for human-in-the-loop deployment.

---

## 📊 Dashboard Capabilities

- Live decision stream per tracked entity
- Risk magnitude and history visualization
- Explicit decision explanations (“why did it warn/abstain?”)
- Sensitivity controls and memory reset (for exploration)
- System health and analytics panels

The UI is designed to feel like a **security operations dashboard**, not a demo.

---

## 🛠️ Tech Stack

**Computer Vision**
- YOLOv8
- OpenCV

**Backend**
- FastAPI
- Python

**Frontend**
- React
- Vite

**Infrastructure**
- Docker / Docker Compose

---

## 🚀 Use Cases

SentinelAI is suitable for **assisted monitoring**, not autonomous enforcement:

- Smart buildings
- Public safety monitoring
- Workplace safety systems
- Human-in-the-loop surveillance
- Safety research and observability demos

---

## ⚠️ Design Philosophy

- Prefer **false abstention** over false certainty
- Separate *risk* from *confidence*
- Treat time and history as first-class signals
- Always support human oversight

---

## ▶️ Running the Project (Local)

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```
### Frontend

- cd frontend
- npm install
- npm run dev

  Dashboard runs on: http://localhost:5173

