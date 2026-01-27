import Menu from './Menu.js'

export default class UpgradeMenu extends Menu {

    getTitle() {
        return 'Choose an Upgrade'
    }

    getOptions() {
        return [
            {
                text: this.game.player.upgradeLineA[this.game.player.upgradeIndexA].title,
                action: () => {
                    this.game.player.upgradeLineA[this.game.player.upgradeIndexA].action()

                    this.game.player.upgradeIndexA++
                    if (this.game.player.upgradeIndexA > this.game.player.upgradeLineA.length - 1) {
                        this.game.player.upgradeIndexA = this.game.player.upgradeLineA.length - 1
                    }


                    this.game.gameState = 'PLAYING'
                    this.game.currentMenu = null
                    this.game.inputHandler.keys.clear()
                }
            },
            {
                text: this.game.player.upgradeLineB[this.game.player.upgradeIndexB].title,
                action: () => {
                    this.game.player.upgradeLineB[this.game.player.upgradeIndexB].action()
                    
                    this.game.player.upgradeIndexB++
                    if (this.game.player.upgradeIndexB > this.game.player.upgradeLineB.length - 1) {
                        this.game.player.upgradeIndexB = this.game.player.upgradeLineB.length - 1
                    }

                    this.game.gameState = 'PLAYING'
                    this.game.currentMenu = null
                    this.game.inputHandler.keys.clear()
                }
            },
        ]
    }
}