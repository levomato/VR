# Three.js & ammo.js

## Simple example of Three.js with ammo.js

- Contains a **CSG Example with BufferGeometries**.
- Contains the **Flat Package for 2D Elements**.

---

Run `npm install` and `npm start`

# Völkerball VR

Diese VR-Anwendung wurde mithilfe von enable3D, einem Framework für THREE.js, welches die Physik-Engine Ammo.js bereitstellt, entwickelt. Um sie zu nutzen bitte folgender Anleitung folgen.

## Repository klonen

Dies ist der Link zum Repository. Der Source-Code befindet sich im Branch VR-Völkerball.
https://gitlab.hs-esslingen.de/lekeit00/vr-voelkerball.git

## Installation

Einfach im Root-Directory "npm install" ausführen und Three.js und die anderen Packages zu installieren.

## Starten

Durch "npm start" wird der "Five-Server" auf localhost:5555 gestartet. Über die Chrome DevTools kann das Port forwarding auf die VR Brille erfolgen.

## Spielprinzip

In der VR Umgebung angekommen zählt ein Countdown runter, bis das Spiel startet. Durch das drücken des Trigger Buttons kann gelaufen werden. Hinter dem Spieler steht ein Schild, welches durch drücken des Touch-Buttons mit dem RayCaster verschoben werden kann. Leider funktioniert dies nicht, da die Physik dem Schild entgegenwirkt. Schält man die Physik des Schilds aus, ist der RayCaster funktionstüchtig, das Schild hat aber keine Wirkung mehr als Schild. Leider konnte ich dies nicht beheben. An einer Wand ist eine Anzeige, welche zeigt, wie viele Leben man noch hat. Wurde man 5 mal abgeschossen, so ist das Spiel vorbei und man kann es neu Laden durch drücken des Touch Buttons.
