import SmallEnemy from "./enemies/SmallEnemy.js"
import MediumEnemy from "./enemies/MediumEnemy.js"
import LargeEnemy from "./enemies/LargeEnemy.js"
import BossEnemy from "./enemies/BossEnemy.js"
import AmmoPickup from "./AmmoPickup.js"
import HealthPickup from "./HealthPickup.js"

/**
 * Hanterar spawning av fiender i waves
 * Konfigureras av leveln för att definiera när och hur fiender spawnas
 */
export default class EnemySpawner {
    constructor(game, config = {}) {
        this.game = game
        
        // Spawn points (definieras av leveln)
        this.spawnPoints = config.spawnPoints || []
        
        // Wave konfiguration
        this.waves = config.waves || []
        this.currentWave = 0
        this.waveInProgress = false
        this.enemiesInWave = 0
        this.enemiesKilled = 0
        
        // Spawn timing
        this.spawnTimer = 0
        this.spawnDelay = 2000 // 2 sekunder mellan spawns
        this.waveDelay = 5000  // 5 sekunder mellan waves
        this.waveDelayTimer = 0
        
        // Countdown display
        this.countdownActive = false
        this.countdownTimer = 0
        this.countdownDuration = 3000 // 3 sekunder countdown
        this.countdownWaveNumber = 0
        
        // Wave state
        this.currentWaveEnemies = []
    }
    
    /**
     * Startar spawner systemet
     */
    start() {
        this.currentWave = 0
        this.startNextWave()
    }
    
    /**
     * Startar nästa wave
     */
    startNextWave() {
        if (this.currentWave >= this.waves.length) {
            console.log('Alla waves klara!')
            this.game.gameState = 'WIN'
            return
        }
        
        // Starta countdown
        this.countdownActive = true
        this.countdownTimer = this.countdownDuration
        this.countdownWaveNumber = this.currentWave + 1
    }
    
    /**
     * Startar wave efter countdown
     */
    beginWave() {
        const wave = this.waves[this.currentWave]
        console.log(`Wave ${this.currentWave + 1} börjar! ${wave.enemies.length} fiender`)
        
        this.waveInProgress = true
        this.currentWaveEnemies = [...wave.enemies] // Kopiera enemy-listan
        this.enemiesInWave = wave.enemies.length
        this.enemiesKilled = 0
        this.spawnTimer = 0
        this.countdownActive = false
    }
    
    /**
     * Spawnar en fiende på en slumpmässig spawn point
     */
    spawnEnemy(enemyType) {
        if (this.spawnPoints.length === 0) {
            console.warn('Inga spawn points definierade!')
            return null
        }
        
        // Välj en slumpmässig spawn point
        const spawnPoint = this.spawnPoints[Math.floor(Math.random() * this.spawnPoints.length)]
        
        // Skapa rätt typ av fiende
        let enemy = null
        switch(enemyType) {
            case 'small':
                enemy = new SmallEnemy(this.game, spawnPoint.x, spawnPoint.y)
                break
            case 'medium':
                enemy = new MediumEnemy(this.game, spawnPoint.x, spawnPoint.y)
                break
            case 'large':
                enemy = new LargeEnemy(this.game, spawnPoint.x, spawnPoint.y)
                break
            case 'boss':
                enemy = new BossEnemy(this.game, spawnPoint.x, spawnPoint.y)
                break
            default:
                console.warn(`Okänd enemy type: ${enemyType}`)
                enemy = new MediumEnemy(this.game, spawnPoint.x, spawnPoint.y)
        }
        
        return enemy
    }
    
    /**
     * Notifierar spawner när en fiende dödas
     */
    onEnemyKilled() {
        this.enemiesKilled++
        
        // Kolla om wave är klar
        if (this.enemiesKilled >= this.enemiesInWave) {
            this.onWaveComplete()
        }
    }
    
    /**
     * Kallas när en wave är klar
     */
    onWaveComplete() {
        console.log(`Wave ${this.currentWave + 1} klar!`)
        this.waveInProgress = false
        this.currentWave++
        this.waveDelayTimer = this.waveDelay
        
        // Spawna 10 ammo pickups som belöning
        this.spawnWaveReward()
        
        // Callback till game om den finns
        if (this.game.onWaveComplete) {
            this.game.onWaveComplete(this.currentWave)
        }
    }
    
    /**
     * Spawnar ammo pickups som belöning efter wave
     */
    spawnWaveReward() {
        const ammoCount = 10
        const healthCount = 1
        const centerX = this.game.worldWidth / 2
        const centerY = this.game.worldHeight / 2
        
        // Spawna ammo med "explosion" effekt
        for (let i = 0; i < ammoCount; i++) {
            const angle = (i / ammoCount) * Math.PI * 2 + Math.random() * 0.3
            const speed = 0.3 + Math.random() * 0.2 // 0.3-0.5 hastighet
            
            // Beräkna target position
            const targetRadius = 60 + Math.random() * 20
            const targetX = centerX + Math.cos(angle) * targetRadius
            const targetY = centerY + Math.sin(angle) * targetRadius
            
            // Skapa pickup med physics
            const pickup = new AmmoPickup(this.game, centerX, centerY - 30, {
                velocityX: Math.cos(angle) * speed,
                velocityY: -0.5 + Math.sin(angle) * speed * 0.5, // Flyg uppåt först
                gravity: 0.0008,
                isFlying: true,
                rotationSpeed: (Math.random() - 0.5) * 0.01 // Rotera medan de flyger
            })
            pickup.groundY = targetY
            this.game.ammoPickups.push(pickup)
        }

        for (let i = 0; i < healthCount; i++) {
            const angle = (i / healthCount) * Math.PI * 2 + Math.random() * 0.3
            const speed = 0.3 + Math.random() * 0.2 // 0.3-0.5 hastighet
            
            // Beräkna target position
            const targetRadius = 60 + Math.random() * 20
            const targetX = centerX + Math.cos(angle) * targetRadius
            const targetY = centerY + Math.sin(angle) * targetRadius
            
            // Skapa pickup med physics
            const pickup = new HealthPickup(this.game, centerX, centerY - 30, {
                velocityX: Math.cos(angle) * speed,
                velocityY: -0.5 + Math.sin(angle) * speed * 0.5, // Flyg uppåt först
                gravity: 0.0008,
                isFlying: true,
                rotationSpeed: (Math.random() - 0.5) * 0.01 // Rotera medan de flyger
            })
            pickup.groundY = targetY
            this.game.healthPickups.push(pickup)
        }
        
        console.log('+10 ammo reward!')
    }
    
    /**
     * Uppdaterar spawner logik
     */
    update(deltaTime) {
        // Hantera countdown
        if (this.countdownActive) {
            this.countdownTimer -= deltaTime
            if (this.countdownTimer <= 0) {
                this.beginWave()
            }
            return
        }
        
        // Om vi väntar mellan waves
        if (!this.waveInProgress && this.waveDelayTimer > 0) {
            this.waveDelayTimer -= deltaTime
            
            if (this.waveDelayTimer <= 0) {
                this.startNextWave()
            }
            return
        }
        
        // Om ingen wave är aktiv och vi inte väntar, starta första wave
        if (!this.waveInProgress && this.currentWave === 0) {
            this.startNextWave()
            return
        }
        
        // Spawna fiender från nuvarande wave
        if (this.waveInProgress && this.currentWaveEnemies.length > 0) {
            this.spawnTimer -= deltaTime
            
            if (this.spawnTimer <= 0) {
                // Spawna nästa fiende i listan
                const enemyType = this.currentWaveEnemies.shift()
                const enemy = this.spawnEnemy(enemyType)
                
                if (enemy) {
                    this.game.enemies.push(enemy)
                }
                
                // Återställ timer om det finns fler fiender kvar
                if (this.currentWaveEnemies.length > 0) {
                    this.spawnTimer = this.spawnDelay
                }
            }
        }
    }
    
    /**
     * Rita spawner info
     */
    draw(ctx, camera) {
        // Rita countdown i mitten av skärmen
        if (this.countdownActive) {
            const countdown = Math.ceil(this.countdownTimer / 1000)
            
            ctx.save()
            ctx.fillStyle = 'white'
            ctx.font = 'bold 72px Arial'
            ctx.textAlign = 'center'
            ctx.shadowColor = '#000000'
            ctx.shadowOffsetX = 4
            ctx.shadowOffsetY = 4
            ctx.shadowBlur = 8
            
            // Visa nummer eller "Wave X starts"
            if (countdown > 0) {
                ctx.fillText(countdown, this.game.width / 2, this.game.height / 2)
            } else {
                ctx.font = 'bold 48px Arial'
                ctx.fillText(`Wave ${this.countdownWaveNumber} starts!`, this.game.width / 2, this.game.height / 2)
            }
            
            ctx.restore()
        }
        
        // Rita spawn points bara i debug-läge
        if (!this.game.inputHandler.debugMode) return
        
        this.spawnPoints.forEach(point => {
            const screenX = point.x - camera.x
            const screenY = point.y - camera.y
            
            ctx.strokeStyle = 'lime'
            ctx.lineWidth = 2
            ctx.beginPath()
            ctx.arc(screenX, screenY, 20, 0, Math.PI * 2)
            ctx.stroke()
            
            ctx.fillStyle = 'lime'
            ctx.font = '12px Arial'
            ctx.fillText('SPAWN', screenX - 20, screenY - 25)
        })
    }
}
