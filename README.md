# 🛡️ PassEvolver v1.2

<div align="center">

```
  ____                 _____            _                 
 |  _ \ __ _ ___ ___  | ____|_   _____ | |_   _____ _ __  
 | |_) / _` / __/ __| |  _| \ \ / / _ \| \ \ / / _ \ '__| 
 |  __/ (_| \__ \__ \ | |___ \ V / (_) | |\ V /  __/ |    
 |_|   \__,_|___/___/ |_____| \_/ \___/|_| \_/ \___|_|    
```

### Deterministic Password Engine & Manifest V3 WebExtension

**100% Offline-First • Zero Cloud Network Calls • High-Entropy Deterministic Key Obfuscation**

[![Offline Ready](https://img.shields.io/badge/Status-🟢%20OFFLINE%20READY-00FF87?style=for-the-badge&labelColor=0C0D10)](https://github.com/Rishikesh-001/Pass-Evolver)
[![Manifest V3](https://img.shields.io/badge/Extension-Manifest%20V3-00E5FF?style=for-the-badge&labelColor=0C0D10)](https://github.com/Rishikesh-001/Pass-Evolver)
[![Entropy Rating](https://img.shields.io/badge/Entropy-CRITICAL__MAXIMUM-FF0055?style=for-the-badge&labelColor=0C0D10)](https://github.com/Rishikesh-001/Pass-Evolver)

---

</div>

> [!IMPORTANT]
> **PassEvolver** transforms memorable phrases into repeatable, high-entropy cryptographic keys without storing master passwords in cloud vaults. Everything runs 100% client-side in local browser memory.

---

## 📐 12-Stage Deterministic Evolution Pipeline

PassEvolver uses a zero-dependency, 12-stage mathematical transformation pipeline to produce repeatable passwords:

```mermaid
flowchart TD
    A["🔤 Memorable Phrase Input"] --> B["⚡ FNV-1a 32-bit Hash"]
    B --> C["🎲 Mulberry32 PRNG Seed"]
    C --> D["🔄 Seeded Caesar Shift"]
    D --> E["🔠 Uppercase Pattern Injection"]
    E --> F["🏷️ Thematic Token Append (_x86-matrix)"]
    F --> G["🔢 Deterministic Digit Insertion"]
    G --> H["🔣 Symbol Substitution"]
    H --> I["🔁 String Reversal & Character Filling"]
    I --> J["🔀 Knuth-Fisher-Yates Permutation"]
    J --> K["📐 Target Length Trimming (8 - 32 Chars)"]
    K --> L["🛡️ Final Symbol Guarantee & Output Key"]

    style A fill:#141519,stroke:#FFFFFF,color:#FFFFFF
    style B fill:#141519,stroke:#00FF87,color:#00FF87
    style C fill:#141519,stroke:#00FF87,color:#00FF87
    style L fill:#141519,stroke:#00FF87,color:#00FF87
```

---

## ✨ Key Features

| Feature | Web Dashboard | Manifest V3 Extension |
| :--- | :---: | :---: |
| **Deterministic Engine (8–32 Chars)** | ✅ | ✅ |
| **Character Syntax Highlighting** | ✅ | ✅ |
| **Mask / Reveal Eye Toggle (`👁️`)** | ✅ | ✅ |
| **6-Segment Neon Entropy Bar** | ✅ | ✅ |
| **10x Parallel Determinism Verifier** | ✅ | ⚡ |
| **Auto Domain Salt Detection** | ⚡ | ✅ |
| **1-Click Password Auto-Fill** | ⚡ | ✅ |
| **Pure White Glowing Aura Cursor** | ✅ | ⚡ |
| **Seamless Preloader Screen** | ✅ | ⚡ |
| **100% Client-Side Offline PWA** | ✅ | ✅ |

---

## 🎨 UI Design System

PassEvolver is styled inspired by modern cybersecurity tools (Linear, Raycast, 1Password, Vercel):

- **Matte Base**: `#0C0D10` dark backdrop with ambient glowing vignetting.
- **Glass Cards**: `#141519` backdrop blur (`blur(16px)`) with subtle white borders.
- **Neon Accents**: Electric `#00FF87` (Green) and `#00E5FF` (Cyan) syntax highlighting.
- **Interactive Micro-Animations**: Card hover elevations (`translateY(-4px)`), ambient green aura shadows, icon rotations (`scale(1.25)`), and compact white cursor trails (`120px`).

---

## 🧩 Manifest V3 Browser Extension Installation

PassEvolver includes a native WebExtension package for **Chrome, Edge, Brave, Opera, and Firefox**.

```
Pass-Evolver/
├── extension/
│   ├── manifest.json       <-- WebExtension Manifest V3
│   ├── popup.html          <-- Compact 380px x 560px Popup UI
│   ├── popup.css           <-- Extension Stylesheet
│   ├── popup.js            <-- Domain Auto-Salt & 1-Click Auto-Fill
│   ├── engine.js           <-- 100% Offline Evolution Engine
│   └── icons/              <-- Extension Icons
```

### 3-Step Setup:
1. Open `chrome://extensions` (or `edge://extensions`) in your browser.
2. Enable **Developer mode** in the top right corner.
3. Click **Load unpacked** and select the [`extension/`](extension/) directory from this repository.

> [!TIP]
> Opening the extension popup on any website (e.g., `github.com`) automatically sets the **Service Salt** to the active website domain!

---

## 💻 Local Web Application Setup

### Prerequisites
- Node.js installed on your system.

### Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/Rishikesh-001/Pass-Evolver.git
   cd Pass-Evolver
   ```

2. Start the local server:
   ```bash
   npx -y serve . -p 8080
   ```

3. Open your browser to **`http://localhost:8080`**.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + Shift + C` | Copy generated password to clipboard |
| `Esc` | Clear phrase input / close active modals |

---

## 📜 Security Philosophy

> [!NOTE]
> PassEvolver does not replace KDFs for vault encryption but creates repeatable, deterministic aliases for secondary assets. Zero network requests are performed by the application.

---

## 📄 License
Released under the MIT License. © 2024 PASSEVOLVER SECURE.