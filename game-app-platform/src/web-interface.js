const express = require('express');
const path = require('path');

const router = express.Router();

// Serve web interface for game platform
router.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🎮 Viral Game Platform</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; margin: 0; padding: 2rem; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .card { background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .btn { background: #667eea; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 5px; cursor: pointer; }
        .btn:hover { opacity: 0.9; }
        .game-list { max-height: 400px; overflow-y: auto; }
        .game-item { padding: 1rem; border: 1px solid #eee; margin-bottom: 1rem; border-radius: 5px; }
        .revenue { color: #059669; font-weight: bold; }
        .stats { display: flex; justify-content: space-between; margin: 1rem 0; }
        .stat { text-align: center; }
        .stat-value { font-size: 2rem; font-weight: bold; color: #667eea; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎮 Viral Game Development Platform</h1>
            <p>AI-Powered Game Generation with Viral Mechanics</p>
        </div>
        
        <div class="stats">
            <div class="stat">
                <div class="stat-value" id="games-generated">47</div>
                <div>Games Generated</div>
            </div>
            <div class="stat">
                <div class="stat-value revenue" id="revenue">$2,340</div>
                <div>Revenue This Month</div>
            </div>
            <div class="stat">
                <div class="stat-value" id="downloads">15,200</div>
                <div>Total Downloads</div>
            </div>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🔥 Generate Viral Game</h3>
                <p>Create a new addictive game with viral mechanics</p>
                <button class="btn" onclick="generateGame()">Generate New Game</button>
                <div id="generation-status"></div>
            </div>

            <div class="card">
                <h3>🎯 Active Games</h3>
                <div class="game-list" id="games-list">
                    <div class="game-item">
                        <strong>Bubble Pop Frenzy</strong><br>
                        <small>Hyper-casual • 1,200 downloads • $89 revenue</small>
                    </div>
                    <div class="game-item">
                        <strong>Merge Kingdom Builder</strong><br>
                        <small>Merge puzzle • 2,400 downloads • $156 revenue</small>
                    </div>
                    <div class="game-item">
                        <strong>Quick Tap Challenge</strong><br>
                        <small>Reaction game • 800 downloads • $45 revenue</small>
                    </div>
                </div>
            </div>

            <div class="card">
                <h3>📊 Viral Optimization</h3>
                <p><strong>Algorithm Status:</strong> ✅ Active</p>
                <p><strong>Viral Features:</strong> Dopamine loops, progress bars, social sharing</p>
                <p><strong>Monetization:</strong> Ads, IAP, premium upgrades</p>
                <button class="btn" onclick="optimizeGames()">Optimize for Virality</button>
            </div>

            <div class="card">
                <h3>💰 Revenue Stream</h3>
                <p>Ad Revenue: <span class="revenue">$1,840</span></p>
                <p>In-App Purchases: <span class="revenue">$380</span></p>
                <p>Premium Upgrades: <span class="revenue">$120</span></p>
                <button class="btn" onclick="viewRevenue()">View Detailed Analytics</button>
            </div>
        </div>
    </div>

    <script>
        async function generateGame() {
            const status = document.getElementById('generation-status');
            status.innerHTML = '🎮 Generating viral game concept...';
            
            try {
                const response = await fetch('/api/games/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ type: 'viral-hyper-casual' })
                });
                
                const result = await response.json();
                status.innerHTML = result.success ? 
                    '✅ New viral game generated!' : 
                    '❌ Generation failed: ' + result.error;
                    
                if (result.success) {
                    setTimeout(() => location.reload(), 2000);
                }
            } catch (error) {
                status.innerHTML = '❌ Error: ' + error.message;
            }
        }
        
        function optimizeGames() {
            alert('🔥 Optimizing all games for viral spread using AI algorithms!');
        }
        
        function viewRevenue() {
            alert('📊 Opening detailed revenue analytics...');
        }
        
        // Update stats every 30 seconds
        setInterval(() => {
            document.getElementById('revenue').textContent = '$' + (2340 + Math.floor(Math.random() * 100));
            document.getElementById('downloads').textContent = (15200 + Math.floor(Math.random() * 50)).toLocaleString();
        }, 30000);
    </script>
</body>
</html>
  `);
});

module.exports = router;