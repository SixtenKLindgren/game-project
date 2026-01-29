import GameBase from "../GameBase.js"
import TwinstickPlayer from "./TwinstickPlayer.js"
import Projectile from "../Projectile.js"
import TwinstickArena from "./TwinstickArena.js"
import AmmoPickup from "./AmmoPickup.js"
import XPPickup from "./XPPickup.js"
import HealthPickup from "./HealthPickup.js"
import EnemySpawner from "./EnemySpawner.js"
import PauseMenu from "../menus/PauseMenu.js"
import MainMenu from "../menus/MainMenu.js"

export default class TwinstickGame extends GameBase {
    constructor(canvas) {
        super(canvas)

        this.gameState = 'MENU'
        this.currentMenu = new MainMenu(this)

        // Justera world size för top-down spel
        this.worldWidth = canvas.width * 1.5
        this.worldHeight = canvas.height * 1.5
        this.camera.setWorldBounds(this.worldWidth, this.worldHeight)

        this.menuImage = new Image()
        this.menuImage.src = './src/assets/Pixel Adventure 1/Main Characters/Mask Dude/MenuImg.png'

        // Specifika egenskaper för TwinstickGame

        this.init()
    }

    init() {
        this.score = 0
        this.player = null
        this.npcs = []
        this.items = []
        this.projectiles = []
        this.enemyProjectiles = []
        this.ammoPickups = []
        this.xpPickups = []
        this.healthPickups = []
        this.arena = null
        this.spawner = null
        this.enemies = []
        // Skapa arena
        this.arena = new TwinstickArena(this)
        const arenaData = this.arena.getData()
        
        // Initiera spelobjekt som spelare, NPCs, items etc
        this.player = new TwinstickPlayer(
            this,
            arenaData.playerSpawnX,
            arenaData.playerSpawnY,
            48,
            48,
            'purple'
        )
        
        // Återställ camera
        this.camera.x = 0
        this.camera.y = 0
        this.camera.targetX = 0
        this.camera.targetY = 0
        
        // Skapa enemy spawner med arena's wave config
        this.spawner = new EnemySpawner(this, arenaData.waveConfig)
        this.spawner.start()
    }
    
    restart() {
        this.init()
        this.currentMenu = null
        this.gameState = 'PLAYING'
        // Återställ spelet till initial state
    }
    
    addProjectile(x, y, directionX, directionY) {
        // Skapa en ny projektil med Projectile-klassen
        const projectile = new Projectile(this, x, y, directionX, directionY)
        projectile.speed = 0.6 // Twinstick är snabbare än platformer
        projectile.color = 'yellow'
        projectile.width = 8
        projectile.height = 8
        this.projectiles.push(projectile)
    }
    
    addEnemyProjectile(x, y, directionX, directionY) {
        // Skapa fiendens projektil
        const projectile = new Projectile(this, x, y, directionX, directionY)
        projectile.speed = 0.3 // Mycket långsammare än spelarens projektiler
        projectile.color = 'red'
        projectile.width = 8
        projectile.height = 8
        this.enemyProjectiles.push(projectile)
    }

    update(deltaTime) {
        if (this.currentMenu) {
            this.currentMenu.update(deltaTime)
            return
        }


        if (!this.inputHandler || !this.inputHandler.keys) {
            return
        }

        
        // Kolla restart input
        if (this.inputHandler.keys.has('r') || this.inputHandler.keys.has('R')) {
            if (this.gameState === 'GAME_OVER' || this.gameState === 'WIN') {
                this.restart()
                return
            }
        }

        if (this.inputHandler.keys.has('Escape')) {
            if (this.gameState === 'PLAYING') {
                this.gameState = 'PAUSED'
                this.currentMenu = new PauseMenu(this)
                return
            }
        }

        if (this.gameState !== 'PLAYING')  return
        
        // Uppdatera spel-logik varje frame
        const playerPrevX = this.player.x
        const playerPrevY = this.player.y
        
        // Uppdatera spawner
        if (this.spawner) {
            this.spawner.update(deltaTime)
        }
        
        this.player.update(deltaTime)
        
        // Kolla kollision mellan spelare och väggar
        // Axis-separated collision - testa varje axel oberoende
        const arenaData = this.arena.getData()
        
        // Spara nya positionen efter update
        const playerNewX = this.player.x
        const playerNewY = this.player.y
        
        // Testa X-axeln: Använd nya X men gamla Y
        this.player.y = playerPrevY
        let hasXCollision = false
        for (const wall of arenaData.walls) {
            if (this.player.intersects(wall)) {
                hasXCollision = true
                break
            }
        }
        if (hasXCollision) {
            this.player.x = playerPrevX
        }
        
        // Testa Y-axeln: Använd nuvarande X (antingen ny eller återställd) och nya Y
        this.player.y = playerNewY
        let hasYCollision = false
        for (const wall of arenaData.walls) {
            if (this.player.intersects(wall)) {
                hasYCollision = true
                break
            }
        }
        if (hasYCollision) {
            this.player.y = playerPrevY
        }
        
        // Uppdatera alla projektiler
        this.projectiles.forEach(projectile => {
            projectile.update(deltaTime)
            
            // Kolla kollision mellan projektiler och väggar
            arenaData.walls.forEach(wall => {
                if (projectile.intersects(wall)) {
                    projectile.markedForDeletion = true
                }
            })
        })
        
        // Ta bort markerade projektiler
        this.projectiles = this.projectiles.filter(p => !p.markedForDeletion)
        
        // Uppdatera fiender
        this.enemies.forEach(enemy => {
            const enemyPrevX = enemy.x
            const enemyPrevY = enemy.y
            
            enemy.update(deltaTime)
            
            // Kolla kollision mellan fiender och väggar
            let hasCollision = false
            arenaData.walls.forEach(wall => {
                const collision = enemy.getCollisionData(wall)
                if (collision) {
                    hasCollision = true
                    if (collision.direction === 'left' || collision.direction === 'right') {
                        enemy.x = enemyPrevX
                    }
                    if (collision.direction === 'top' || collision.direction === 'bottom') {
                        enemy.y = enemyPrevY
                    }
                }
            })
            
            // Om fienden kolliderar under SEEK-läge, försök hitta en väg runt
            if (hasCollision && enemy.state === 'seek') {
                enemy.handleWallAvoidance(deltaTime)
            }
        })
        
        // Uppdatera fiendens projektiler
        this.enemyProjectiles.forEach(projectile => {
            projectile.update(deltaTime)
            
            // Kolla kollision med väggar
            arenaData.walls.forEach(wall => {
                if (projectile.intersects(wall)) {
                    projectile.markedForDeletion = true
                }
            })
            
            if (projectile.intersects(this.player)) {
                if (!this.player.isInvulnerable) {
                    let dead = this.player.takeDamage(1)
                    if (dead) {
                        this.gameState = 'GAME_OVER'
                    }
                }
                projectile.markedForDeletion = true
            }
        })
        
        // Kolla kollision mellan spelarens projektiler och fiender
        this.projectiles.forEach(projectile => {
            this.enemies.forEach(enemy => {
                if (projectile.intersects(enemy)) {
                    let dead = enemy.takeDamage(1)
                    projectile.markedForDeletion = true

                    if (dead) {
                        // Notifiera spawner om fiende dödas
                        if (this.spawner) {
                            this.spawner.onEnemyKilled()
                        }
                        
                        // Spawna ammo pickups baserat på fiendens health med flying effekt
                        const ammoCount = enemy.maxHealth
                        const centerX = enemy.x + enemy.width / 2
                        const centerY = enemy.y + enemy.height / 2
                        
                        for (let i = 0; i < ammoCount; i++) {
                            const angle = Math.random() * Math.PI * 2
                            const speed = 0.2 + Math.random() * 0.15
                            const targetRadius = 15 + Math.random() * 20
                            
                            const pickup = new AmmoPickup(this, centerX, centerY - 20, {
                                velocityX: Math.cos(angle) * speed,
                                velocityY: -0.3 + Math.sin(angle) * speed * 0.3,
                                gravity: 0.0008,
                                isFlying: true,
                                rotationSpeed: (Math.random() - 0.5) * 0.008
                            })
                            pickup.groundY = centerY + Math.sin(angle) * targetRadius
                            this.ammoPickups.push(pickup)
                        }

                        // Spawna XP pickups (fler än ammo, kanske 2x så många)
                        const xpCount = enemy.maxHealth * 2
                        for (let i = 0; i < xpCount; i++) {
                            const angle = Math.random() * Math.PI * 2
                            const speed = 0.15 + Math.random() * 0.1
                            const targetRadius = 20 + Math.random() * 25
                            
                            const pickup = new XPPickup(this, centerX, centerY - 20, {
                                velocityX: Math.cos(angle) * speed,
                                velocityY: -0.2 + Math.sin(angle) * speed * 0.4,
                                gravity: 0.0008,
                                isFlying: true,
                                rotationSpeed: (Math.random() - 0.5) * 0.006,
                                xpValue: 5 // Each XP pickup gives 5 XP
                            })
                            pickup.groundY = centerY + Math.sin(angle) * targetRadius
                            this.xpPickups.push(pickup)
                        }
                    }
                }
            })
        })
        
        // Ta bort markerade fiendens projektiler
        this.enemyProjectiles = this.enemyProjectiles.filter(p => !p.markedForDeletion)
        
        // Ta bort döda fiender
        this.enemies = this.enemies.filter(e => !e.markedForDeletion)
        
        // Kolla kollision mellan spelare och ammo pickups
        this.ammoPickups.forEach(pickup => {
            const pickupPrevX = pickup.x
            const pickupPrevY = pickup.y
            
            // Uppdatera pickup physics
            pickup.update(deltaTime)
            
            // Kolla kollision med väggar om pickupen flyger
            if (pickup.isFlying) {
                arenaData.walls.forEach(wall => {
                    const collision = pickup.getCollisionData(wall)
                    if (collision) {
                        // Reflektera velocity baserat på kollisionsriktning
                        if (collision.direction === 'left' || collision.direction === 'right') {
                            pickup.x = pickupPrevX
                            pickup.velocityX = -pickup.velocityX * 0.6 // Reflektera och dämpa
                        }
                        if (collision.direction === 'top' || collision.direction === 'bottom') {
                            pickup.y = pickupPrevY
                            pickup.velocityY = -pickup.velocityY * 0.6 // Reflektera och dämpa
                        }
                    }
                })
            }
            
            // Kolla kollision med spelare (kan plocka upp även när de flyger)
            if (this.player.intersects(pickup)) {
                this.player.addAmmo(pickup.ammoValue)
                pickup.markedForDeletion = true
            }
        })
        
        // Ta bort uppplockade ammo pickups
        this.ammoPickups = this.ammoPickups.filter(p => !p.markedForDeletion)


        this.xpPickups.forEach(pickup => {
            const pickupPrevX = pickup.x
            const pickupPrevY = pickup.y

            pickup.update(deltaTime)
            
            if (pickup.isFlying) {
                arenaData.walls.forEach(wall => {
                    const collision = pickup.getCollisionData(wall)
                    if (collision) {
                        if (collision.direction === 'left' || collision.direction === 'right') {
                            pickup.x = pickupPrevX
                            pickup.velocityX = -pickup.velocityX * 0.6 // Reflektera och dämpa
                        }
                        if (collision.direction === 'top' || collision.direction === 'bottom') {
                            pickup.y = pickupPrevY
                            pickup.velocityY = -pickup.velocityY * 0.6 // Reflektera och dämpa
                        }
                    }
                })
            }
            
            if (this.player.intersects(pickup)) {
                this.player.addXP(pickup.XPValue)
                pickup.markedForDeletion = true
            }
        })
        
        // Ta bort uppplockade XP pickups
        this.xpPickups = this.xpPickups.filter(p => !p.markedForDeletion)

        this.healthPickups.forEach(pickup => {
            const pickupPrevX = pickup.x
            const pickupPrevY = pickup.y

            pickup.update(deltaTime)
            
            if (pickup.isFlying) {
                arenaData.walls.forEach(wall => {
                    const collision = pickup.getCollisionData(wall)
                    if (collision) {
                        if (collision.direction === 'left' || collision.direction === 'right') {
                            pickup.x = pickupPrevX
                            pickup.velocityX = -pickup.velocityX * 0.6 // Reflektera och dämpa
                        }
                        if (collision.direction === 'top' || collision.direction === 'bottom') {
                            pickup.y = pickupPrevY
                            pickup.velocityY = -pickup.velocityY * 0.6 // Reflektera och dämpa
                        }
                    }
                })
            }
            
            if (this.player.intersects(pickup)) {
                this.player.addHealth(pickup.HealthValue)
                pickup.markedForDeletion = true
            }
        })
        
        // Ta bort uppplockade health pickups
        this.healthPickups = this.healthPickups.filter(p => !p.markedForDeletion)

        this.camera.follow(this.player)
        this.camera.update(deltaTime)
        
        // Kolla lose condition - spelaren är död
        if (this.player.health <= 0 && this.gameState === 'PLAYING') {
            this.gameState = 'GAME_OVER'
        }
    }

    draw(ctx) {
        if (!this.inputHandler) return
        // Rita debug-grid om debug-läge är på
        if (this.inputHandler?.debugMode) {
            this.drawDebugGrid(ctx)
        }
        
        // Rita arena (golv och väggar)
        this.arena.draw(ctx, this.camera)
        
        // Rita spelvärlden och objekt
        this.player.draw(ctx, this.camera)
        
        // Rita fiender
        this.enemies.forEach(enemy => {
            enemy.draw(ctx, this.camera)
        })
        
        // Rita alla projektiler
        this.projectiles.forEach(projectile => {
            projectile.draw(ctx, this.camera)
        })
        
        // Rita fiendens projektiler
        this.enemyProjectiles.forEach(projectile => {
            projectile.draw(ctx, this.camera)
        })
        
        // Rita ammo pickups
        this.ammoPickups.forEach(pickup => {
            pickup.draw(ctx, this.camera)
        })
        
        // Rita XP pickups
        this.xpPickups.forEach(pickup => {
            pickup.draw(ctx, this.camera)
        })
        
        // Rita health pickups
        this.healthPickups.forEach(pickup => {
            pickup.draw(ctx, this.camera)
        })
        
        // Rita spawner (debug info)
        if (this.spawner) {
            this.spawner.draw(ctx, this.camera)
        }
        
        // Rita UI (health, ammo, score)
        this.ui.draw(ctx)

        if (this.currentMenu) {
            this.currentMenu.draw(ctx)
        }
    }
    
    // Rita ett 32x32 grid i världen
    drawDebugGrid(ctx) {
        const gridSize = 32
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1
        
        // Beräkna vilka grid-linjer som är synliga på skärmen
        const startX = Math.floor(this.camera.x / gridSize) * gridSize
        const startY = Math.floor(this.camera.y / gridSize) * gridSize
        const endX = this.camera.x + this.width
        const endY = this.camera.y + this.height
        
        // Rita vertikala linjer
        for (let x = startX; x <= endX; x += gridSize) {
            const screenX = x - this.camera.x
            ctx.beginPath()
            ctx.moveTo(screenX, 0)
            ctx.lineTo(screenX, this.height)
            ctx.stroke()
        }
        
        // Rita horisontella linjer
        for (let y = startY; y <= endY; y += gridSize) {
            const screenY = y - this.camera.y
            ctx.beginPath()
            ctx.moveTo(0, screenY)
            ctx.lineTo(this.width, screenY)
            ctx.stroke()
        }
    }
}