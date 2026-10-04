# Port Authority

A dependency-free JavaScript canvas game. Serve this folder with a static web server (for example `python -m http.server 8000`), then open `http://localhost:8000`. JavaScript modules require HTTP hosting rather than opening the HTML file directly.

Move with WASD, arrows, or the touch direction buttons. Approach a matching labeled end head-on: your glowing front port must face into its opening, align within 10 pixels, and move toward it. Sideways, rear, and stationary contact cannot connect. The active adapter turns in four directions with movement, always keeping its unused port forward, including after fitting either end of a 90-degree adapter. Both ends can be used. Straight and 90-degree adapters include USB-A and USB-C male/female combinations. Each fit adds 100 points, rising to 300 when connected immediately after another fit; the bonus decays over six seconds of active play.

Walls and equipment knock off one collected adapter, restoring the previous open port. Your starter adapter remains on the first strike if the chain is empty. Two hits without a successful fit end the run. A 1.4-second collision grace period lets you move away. A successful fit clears strikes. Fit twelve adapters to complete the level. The chain is a rigid assembly: all ports stay joined, and each 90-degree adapter bends the remaining chain. The whole assembly rotates with the active adapter. Collision detection still uses the player head. Space/Escape pauses, and leaving the window pauses automatically. Best scores are saved locally when browser storage is available.

Files: `index.html`, `index.css`, and `game.js` at the root; game elements in `js/`; future media in `assets/`. Run rules and progression checks with `npm test`.
