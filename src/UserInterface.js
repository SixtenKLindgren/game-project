export default class UserInterface {
    constructor(game) {
        this.game = game
        this.fontSize = 24
        this.fontFamily = 'Arial'
        this.textColor = '#FFFFFF'
        this.shadowColor = '#000000'
    }

    draw(ctx) {
        // Rita HUD (score, health, etc)
        this.drawHUD(ctx)

        // Rita game state overlays
        if (this.game.gameState === 'GAME_OVER') {
            this.drawGameOver(ctx)
        } else if (this.game.gameState === 'WIN') {
            this.drawWin(ctx)
        } else if (this.game.gameState === 'PAUSED' && !this.game.currentMenu) {
            this.drawPaused(ctx)
        }
    }

    drawHUD(ctx) {
        ctx.save()

        // Konfigurera text
        ctx.font = `${this.fontSize}px ${this.fontFamily}`
        ctx.fillStyle = this.textColor
        ctx.shadowColor = this.shadowColor
        ctx.shadowOffsetX = 2
        ctx.shadowOffsetY = 2
        ctx.shadowBlur = 3

        // Top-left: Health hearts
        if (this.game.player) {
            // Rita health hearts (röda fyrkanter)
            this.drawHealthHearts(ctx, 20, 20)
        }
        
        // Top-right: Ammo display (twinstick)wa
        if (this.game.player && this.game.player.currentAmmo !== undefined) {
            this.drawAmmoBoxes(ctx, this.game.width - 20, 20)
        }

        if (this.game.player && this.game.player.currentAmmo !== undefined) {
            this.drawExperienceBar(ctx, this.game.width / 2, 45)
        }

        if (this.game.player && this.game.spawner.currentWave !== undefined) {
            this.drawWaveInfo(ctx, this.game.width / 2, 105)
        }
        
        // Om spelet har coins (platformer), visa dem
        if (this.game.coinsCollected !== undefined) {
            ctx.fillText(`Coins: ${this.game.coinsCollected}`, 20, 80)
        }

        // Bottom-right: Score
        ctx.textAlign = 'right'
        ctx.fillText(`Score: ${this.game.score}`, this.game.width - 20, this.game.height - 20)
        ctx.textAlign = 'left'

        ctx.restore()
        
        // Rita reload indicator ovanför spelaren (i world space)
        if (this.game.player && this.game.player.isReloading) {
            this.drawReloadIndicator(ctx)
        }
    }

    drawHealthHearts(ctx, x, y) {
        const heartSize = 24
        const heartSpacing = 4
        const totalHearts = this.game.player.maxHealth
        const currentHearts = this.game.player.health
        
        ctx.save()
        
        for (let i = 0; i < totalHearts; i++) {
            const heartX = x + i * (heartSize + heartSpacing)
            
            if (i < currentHearts) {
                // Full hälsa - röd fyrkant
                ctx.fillStyle = '#FF0000'
            } else {
                // Förlorad hälsa - mörk grå
                ctx.fillStyle = '#333333'
            }
            
            ctx.fillRect(heartX, y, heartSize, heartSize)
            
            // Vit kant
            ctx.strokeStyle = '#FFFFFF'
            ctx.lineWidth = 2
            ctx.strokeRect(heartX, y, heartSize, heartSize)
        }
        
        ctx.restore()
    }
    
    drawAmmoBoxes(ctx, x, y) {
        const boxSize = 16
        const boxSpacing = 4
        const maxDisplay = this.game.player.maxAmmo
        const totalAmmo = this.game.player.currentAmmo
        
        ctx.save()
        
        // Beräkna hur många rutor som ska visas
        const displayBoxes = Math.min(this.game.player.maxAmmo, maxDisplay)
        
        // Rita boxarna från höger till vänster
        for (let i = 0; i < displayBoxes; i++) {
            const boxX = x - (i + 1) * (boxSize + boxSpacing)
            
            if (i < totalAmmo) {
                // Ammo finns - gul box
                ctx.fillStyle = '#FFD700'
            } else {
                // Tom - mörk grå
                ctx.fillStyle = '#333333'
            }
            
            ctx.fillRect(boxX, y, boxSize, boxSize)
            
            // Vit kant
            ctx.strokeStyle = '#FFFFFF'
            ctx.lineWidth = 2
            ctx.strokeRect(boxX, y, boxSize, boxSize)
        }
        
        // Rita reserve ammo under boxarna
        const reserveY = y + boxSize * 2 + 8
        ctx.font = '18px Arial'
        ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
        ctx.textAlign = 'right'
        ctx.shadowColor = '#000000'
        ctx.shadowOffsetX = 1
        ctx.shadowOffsetY = 1
        ctx.shadowBlur = 2
        ctx.fillText(`+${this.game.player.reserveAmmo}`, x, reserveY)
        
        ctx.restore()
    }

    drawExperienceBar(ctx, x, y) {
        const player = this.game.player
        const barWidth = 300
        const barHeight = 40
        const levelPercent = (player.currentXP / player.XPneededforlvl)
        
        ctx.fillStyle = '#333'
        ctx.fillRect(x - barWidth / 2, y - 20, barWidth, barHeight)

        ctx.fillStyle = 'blue'
        ctx.fillRect(x - barWidth / 2, y - 20, barWidth * levelPercent, barHeight)

        ctx.fillStyle = '#fff'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${this.game.player.currentXP} / ${this.game.player.XPneededforlvl}`, x, y)
        ctx.fillText(`LVL : ${this.game.player.currentlvl}`, x, y + 35)
    }

    drawWaveInfo(ctx, x, y) {
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillStyle = '#fff'
        ctx.fillText(`Wave: ${this.game.spawner.currentWave + 1}`, x, y)
    }
    
    drawReloadIndicator(ctx) {
        // Rita ovanför spelaren i world space
        const player = this.game.player
        const camera = this.game.camera
        
        // Beräkna position ovanför spelaren
        const worldX = player.x + player.width / 2
        const worldY = player.y - 30
        const screenX = camera ? worldX - camera.x : worldX
        const screenY = camera ? worldY - camera.y : worldY
        
        ctx.save()
        
        // Reload progress bar
        const barWidth = 60
        const barHeight = 8
        const reloadPercent = 1 - (player.reloadTimer / player.reloadDuration)
        
        // Bakgrund
        ctx.fillStyle = '#333'
        ctx.fillRect(screenX - barWidth / 2, screenY, barWidth, barHeight)
        
        // Progress
        ctx.fillStyle = '#FFC107'
        ctx.fillRect(screenX - barWidth / 2, screenY, barWidth * reloadPercent, barHeight)
        
        // Kant
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 1
        ctx.strokeRect(screenX - barWidth / 2, screenY, barWidth, barHeight)
        
        // Text under progress bar
        ctx.font = '12px Arial'
        ctx.fillStyle = '#FFC107'
        ctx.textAlign = 'center'
        ctx.fillText('RELOADING', screenX, screenY + barHeight + 14)
        
        ctx.restore()
    }

    drawHealthBar(ctx, x, y) {
        const barWidth = 200
        const barHeight = 20
        const healthPercent = this.game.player.health / this.game.player.maxHealth

        ctx.save()

        // Bakgrund (grå)
        ctx.fillStyle = '#333'
        ctx.fillRect(x, y, barWidth, barHeight)

        // Nuvarande health (röd till grön gradient)
        const healthWidth = barWidth * healthPercent

        // Färg baserat på health procent
        if (healthPercent > 0.5) {
            ctx.fillStyle = '#4CAF50' // Grön
        } else if (healthPercent > 0.25) {
            ctx.fillStyle = '#FFC107' // Gul
        } else {
            ctx.fillStyle = '#F44336' // Röd
        }

        ctx.fillRect(x, y, healthWidth, barHeight)

        // Kant
        ctx.strokeStyle = '#FFFFFF'
        ctx.lineWidth = 2
        ctx.strokeRect(x, y, barWidth, barHeight)

        ctx.restore()
    }
    // Obs: drawHealthBar() används fortfarande av platformer-spelet

    drawGameOver(ctx) {
        // Halvgenomskinlig bakgrund
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, this.game.width, this.game.height)

        // Game Over text
        ctx.save()
        ctx.fillStyle = '#FF0000'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('GAME OVER', this.game.width / 2, this.game.height / 2 - 50)

        // Stats
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '30px Arial'
        ctx.fillText(`Final Score: ${this.game.score}`, this.game.width / 2, this.game.height / 2 + 10)
        
        if (this.game.spawner) {
            ctx.fillText(`Waves Completed: ${this.game.spawner.currentWave}`, this.game.width / 2, this.game.height / 2 + 50)
            ctx.fillText(`Enemies Killed: ${this.game.spawner.totalenemiesKilled}`, this.game.width / 2, this.game.height / 2 + 90)
        }

        // Restart instruktion
        ctx.font = '24px Arial'
        ctx.fillText('Press R to Restart', this.game.width / 2, this.game.height / 2 + 140)
        ctx.restore()
    }

    drawWin(ctx) {
        // Halvgenomskinlig bakgrund
        ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'
        ctx.fillRect(0, 0, this.game.width, this.game.height)

        // Victory text
        ctx.save()
        ctx.fillStyle = '#FFD700'
        ctx.font = 'bold 60px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText('VICTORY!', this.game.width / 2, this.game.height / 2 - 50)

        // Score
        ctx.fillStyle = '#FFFFFF'
        ctx.font = '30px Arial'
        ctx.fillText(`All Waves Completed!`, this.game.width / 2, this.game.height / 2 + 20)
        ctx.fillText(`Enemies Killed: ${this.game.spawner.totalenemiesKilled}`, this.game.width / 2, this.game.height / 2 + 60)
        ctx.fillText(`Final Score: ${this.game.score}`, this.game.width / 2, this.game.height / 2 + 100)
        

        // Restart instruktion
        ctx.font = '24px Arial'
        ctx.fillText('Press R to Play Again', this.game.width / 2, this.game.height / 2 + 140)
        ctx.restore()
    }

    drawPaused(ctx) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
        ctx.fillRect(0, 0, this.game.width, this.game.height)

        ctx.save()
        ctx.fillStyle = '#FFFFFF'
        ctx.font = 'bold 48px Arial'
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        ctx.font = '24px Arial'
        ctx.fillText('Press ESC or SPACE to Resume', this.game.width / 2, this.game.height / 2 + 30)
        ctx.fillText('Press R to Restart', this.game.width / 2, this.game.height / 2 + 60)
        ctx.restore()
    }
}
